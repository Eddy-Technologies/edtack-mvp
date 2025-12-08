-- Database Functions and Extensions

-- Enable pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Note: The update_updated_at_column function is already created in 004_user_infos.sql
-- This file is reserved for any additional shared functions that might be needed in the future

-- =============================================================================
-- CREDIT TRANSFER FUNCTION
-- =============================================================================
-- Atomically transfers credits from one user to another with full transaction recording
-- Used for parent-to-child transfers (manual and quiz rewards)
CREATE OR REPLACE FUNCTION transfer_credits_atomic(
  p_from_user_info_id UUID,
  p_to_user_info_id UUID,
  p_amount INTEGER,
  p_description_from TEXT,
  p_description_to TEXT,
  p_metadata_from JSONB DEFAULT '{}'::jsonb,
  p_metadata_to JSONB DEFAULT '{}'::jsonb
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_sender_credit RECORD;
  v_recipient_credit RECORD;
  v_available_balance INTEGER;
  v_new_sender_balance INTEGER;
  v_new_recipient_balance INTEGER;
  v_sender_transaction_id UUID;
  v_recipient_transaction_id UUID;
  v_result JSONB;
BEGIN
  RAISE LOG '[transfer_credits_atomic] Starting transfer: % -> %, amount: %', p_from_user_info_id, p_to_user_info_id, p_amount;

  -- Validate amount
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Transfer amount must be greater than 0. Received: %', p_amount;
  END IF;

  -- Prevent self-transfer
  IF p_from_user_info_id = p_to_user_info_id THEN
    RAISE EXCEPTION 'Cannot transfer credits to yourself';
  END IF;

  -- Lock and fetch sender's credits (prevents race conditions)
  SELECT * INTO v_sender_credit
  FROM user_credits
  WHERE user_info_id = p_from_user_info_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Sender credit record not found for user_info_id: %', p_from_user_info_id;
  END IF;

  -- Calculate available balance (total - reserved)
  v_available_balance := v_sender_credit.credit - COALESCE(v_sender_credit.reserved_credit, 0);

  RAISE LOG '[transfer_credits_atomic] Sender balance: %, reserved: %, available: %',
    v_sender_credit.credit, v_sender_credit.reserved_credit, v_available_balance;

  -- Check sufficient balance
  IF v_available_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient credits. Available: % cents (%.2f SGD), Required: % cents (%.2f SGD)',
      v_available_balance, v_available_balance::numeric / 100, p_amount, p_amount::numeric / 100;
  END IF;

  -- Deduct from sender
  v_new_sender_balance := v_sender_credit.credit - p_amount;
  UPDATE user_credits
  SET credit = v_new_sender_balance,
      updated_at = NOW()
  WHERE user_info_id = p_from_user_info_id;

  RAISE LOG '[transfer_credits_atomic] Deducted % from sender. New balance: %', p_amount, v_new_sender_balance;

  -- Add to recipient (upsert - create if doesn't exist)
  INSERT INTO user_credits (user_info_id, credit, reserved_credit, updated_at)
  VALUES (p_to_user_info_id, p_amount, 0, NOW())
  ON CONFLICT (user_info_id) DO UPDATE SET
    credit = user_credits.credit + p_amount,
    updated_at = NOW()
  RETURNING credit INTO v_new_recipient_balance;

  RAISE LOG '[transfer_credits_atomic] Added % to recipient. New balance: %', p_amount, v_new_recipient_balance;

  -- Create sender transaction record (outgoing)
  INSERT INTO credit_transactions (
    user_info_id,
    transaction_type,
    amount,
    currency,
    description,
    is_internal,
    from_user_info_id,
    to_user_info_id,
    metadata,
    created_at
  ) VALUES (
    p_from_user_info_id,
    'TRANSFER_OUT',
    -p_amount,  -- Negative for outgoing
    'SGD',
    p_description_from,
    true,
    p_from_user_info_id,
    p_to_user_info_id,
    p_metadata_from,
    NOW()
  ) RETURNING id INTO v_sender_transaction_id;

  RAISE LOG '[transfer_credits_atomic] Created sender transaction: %', v_sender_transaction_id;

  -- Create recipient transaction record (incoming)
  INSERT INTO credit_transactions (
    user_info_id,
    transaction_type,
    amount,
    currency,
    description,
    is_internal,
    from_user_info_id,
    to_user_info_id,
    metadata,
    created_at
  ) VALUES (
    p_to_user_info_id,
    'TRANSFER_IN',
    p_amount,  -- Positive for incoming
    'SGD',
    p_description_to,
    true,
    p_from_user_info_id,
    p_to_user_info_id,
    p_metadata_to,
    NOW()
  ) RETURNING id INTO v_recipient_transaction_id;

  RAISE LOG '[transfer_credits_atomic] Created recipient transaction: %', v_recipient_transaction_id;

  -- Build success response
  SELECT jsonb_build_object(
    'success', true,
    'message', format('Successfully transferred %s SGD', (p_amount::numeric / 100)::text),
    'senderBalance', v_new_sender_balance,
    'recipientBalance', v_new_recipient_balance,
    'transferAmount', p_amount,
    'senderTransactionId', v_sender_transaction_id,
    'recipientTransactionId', v_recipient_transaction_id
  ) INTO v_result;

  RAISE LOG '[transfer_credits_atomic] Transfer completed successfully';
  RETURN v_result;

EXCEPTION WHEN OTHERS THEN
  RAISE LOG '[transfer_credits_atomic] Transfer failed: %', SQLERRM;
  RAISE EXCEPTION '[transfer_credits_atomic] Transfer failed: %', SQLERRM;
END;
$$;