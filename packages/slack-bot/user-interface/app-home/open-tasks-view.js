const {
  HomeTab, Header, Divider, Section, Actions, Elements, Input, Bits,
} = require('slack-block-builder');
const pluralize = require('pluralize');
const { DateTime } = require('luxon');

module.exports = (openTasks) => {
  const homeTab = HomeTab({ callbackId: 'tasks-home', privateMetaData: 'open' }).blocks(
    Actions({ blockId: 'task-creation-actions' }).elements(
      Elements.Button({ text: 'Open tasks' }).value('app-home-nav-open').actionId('app-home-nav-open').primary(true),
      Elements.Button({ text: 'Completed tasks' }).value('app-home-nav-completed').actionId('app-home-nav-completed'),
      Elements.Button({ text: 'Create a task' }).value('app-home-nav-create-a-task').actionId('app-home-nav-create-a-task'),
    ),
  );

  if (openTasks.length === 0) {
    homeTab.blocks(
      Header({ text: 'No open tasks' }),
      Divider(),
      Section({ text: 'Looks like you\'ve got nothing to do.' }),
    );
    return homeTab.buildToJSON();
  }

  /*
    Block kit Options have a maximum length of 10, and most people have more than 10 open tasks
    at a given time, so we break the openTasks list into chunks of ten
    and add them as multiple blocks.
  */
  const tasksInputsArray = [];
  let holdingArray = [];
  let start = 0;
  const end = openTasks.length;
  const maxOptionsLength = 10;

  for (start, end; start < end; start += maxOptionsLength) {
    holdingArray = openTasks.slice(start, start + maxOptionsLength);
    tasksInputsArray.push(
      Input({ label: ' ', blockId: `open-task-status-change-${start}` }).dispatchAction().element(Elements.Checkboxes({ actionId: 'blockOpenTaskCheckboxClicked' }).options(holdingArray.map((task) => {
        const option = {
          text: `*${task.title}*`,
          value: `open-task-${task.id}`,
        };
        if (task.dueDate) {
          option.description = `Due ${DateTime.fromJSDate(task.dueDate).toRelativeCalendar()}`;
        }
        return Bits.Option(option);
      }))),
    );
  }
  homeTab.blocks(
    Header({ text: `You have ${openTasks.length} open ${pluralize('task', openTasks.length)}` }),
    Divider(),
    tasksInputsArray,
  );

  return homeTab.buildToJSON();
};
