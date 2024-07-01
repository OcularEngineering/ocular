// const { reloadAppHome } = require('../../utilities');

const appMentionCallback = async ( cbArgs ,container) => {
  try {
    const { event, context, client, say } = cbArgs.event;
    const registeredKeys = Object.keys(container.registrations);
    const chatApproach = container.resolve("askRetrieveReadApproache")
    const results = await chatApproach.run("ocular", extractTextFromEvent(event) ,{
      top: 5, stream: true
    });

    console.log(results);
  
    await say({"blocks": [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `<@${event.user}>! ${results.chat_completion.content}`
        },
      }
    ]});
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }
};

function extractTextFromEvent(event) {
  const textPattern = /<@\w+>\s(.*)/;
  const matches = event.text.match(textPattern);
  return matches ? matches[1] : '';
}

export { appMentionCallback };