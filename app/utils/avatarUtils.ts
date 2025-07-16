/**
 * Generates initials from a user's first and last name
 * @param firstName - User's first name
 * @param lastName - User's last name
 * @param email - User's email as fallback
 * @returns String with 1-2 initials
 */
export function generateInitials(firstName?: string, lastName?: string, email?: string): string {
  // If we have first and last name, use both initials
  if (firstName && lastName) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  // If we only have first name, use first initial
  if (firstName) {
    return firstName.charAt(0).toUpperCase();
  }

  // If we only have last name, use first initial
  if (lastName) {
    return lastName.charAt(0).toUpperCase();
  }

  // Fallback to email initial if no names available
  if (email) {
    return email.charAt(0).toUpperCase();
  }

  // Ultimate fallback
  return 'U';
}

/**
 * Generates a background color based on the user's name or email
 * @param input - String to generate color from (name or email)
 * @returns Tailwind CSS background color class
 */
export function generateAvatarColor(input: string = ''): string {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
    'bg-orange-500',
    'bg-red-500',
  ];

  // Generate a hash from the input string
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Use absolute value and modulo to get color index
  const colorIndex = Math.abs(hash) % colors.length;
  return colors[colorIndex];
}
