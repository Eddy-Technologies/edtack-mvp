export function handleReportSubmit(question, selectedAnswer, reasons, otherReasons) {
  if (selectedAnswer === null) {
    console.log('No answer selected, it is in question state')
  }
  console.log('Report submitted:', {
    question,
    selectedAnswer: selectedAnswer ?? 'No answer selected',
    reasons,
    otherReasons,
  })
  // Here you can call your API to send the report
  // e.g. await $fetch('/api/report', { method: 'POST', body: report })
}

export const QuestionReportReason = Object.freeze({
  IRRELAVENT: 'Irrelavent Content',
  NOT_IN_SYLLB: 'Not in Syllabus',
  INCORRECT_OPT: 'No Valid Options',
  OTHER: 'Other'
})

export const ResultReportReason = Object.freeze({
  IRRELAVENT: 'Irrelavent Content',
  NOT_IN_SYLLB: 'Not in Syllabus',
  INCORRECT_OPT: 'No Valid Options',
  INCORRECT_ANS: 'Incorrect Answer',
  INCORRECT_EXPLN: 'Incorrect Explanation',
  OTHER: 'Other'
})