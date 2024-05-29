import boxen from "boxen"

const defaultConfig = {
  padding: 1,
  borderColor: `blue`,
  borderStyle: `double`,
}

const defaultMessage =
  `Ocular collects anonymous usage analytics\n` +
  `to help improve Ocular for all users.\n` +
  `\n` +
  `If you'd like to opt-out, you can use \`ocular telemetry --disable\`\n`

/**
 * Analytics notice for the end-user
 */
function showAnalyticsNotification(
  config = defaultConfig,
  message = defaultMessage
) {
  console.log(boxen(message, config))
}

export default showAnalyticsNotification