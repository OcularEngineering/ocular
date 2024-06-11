import boxen from "boxen"
import { CustomBorderStyle } from "boxen"
import {BoxStyle, Boxes} from 'cli-boxes';

const borderStyle : CustomBorderStyle = {
  topLeft: 'a',
  topRight: 'b',
  bottomRight: 'c',
  bottomLeft: 'd',
  vertical: 'e',
  horizontal: 'f'
}

const defaultConfig = {
  padding: 1,
  borderColor: `blue`,
  borderStyle: borderStyle,
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