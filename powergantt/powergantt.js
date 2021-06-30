moment.lang('zh-cn');
var powerGantt = function (element, config) {
    this.config = {
        width: "100%",
        height: "420px",
        columnDefaultWidth: "100px",
        scaleDefautWidth: 28,
        scaleDefaultHeight: 32,
        ganttTopDateMode: "YYYY年MM月",
        type: "project"
    }
    this.data = [];
    this.columns = [];
    this.startDate = new Date();
    this.endDate = moment().add(2, 'month').toDate();

    this.el = element;
    this.config = {
        ...this.config,
        ...config
    };
    // this.config = $.extend({}, this.config, config);
    this.init();
}
powerGantt.prototype.init = function () {
    //初始化gantt结构和配置
    this.el.classList.add("power-gantt");
    this.el.style.width = this.config.width;
    this.el.style.height = this.config.height;
    this.el.style.position = "relative";

    this.ganttGrid = document.createElement("div");
    this.ganttGrid.innerHTML = "";
    this.ganttGrid.className = "power-ganttgrid"


    this.ganttView = document.createElement("div");
    this.ganttView.innerHTML = "";
    this.ganttView.className = "power-ganttview"
    this.el.appendChild(this.ganttGrid);
    this.el.appendChild(this.ganttView);
    this.render();

}
powerGantt.prototype.on = function (event, callback) {
    let eventName = "on" + event.replace(event[0], event[0].toUpperCase());
    this[eventName] = callback.bind(this);

}

// powerGantt.prototype.onUserChange = function () {
//     // callback.bind(this, this.data)
// }
powerGantt.prototype.render = function () {
    //数据level处理
    for (var i = 0; i < this.data.length; i++) {
        var project = this.data[i];
        this.toLevelData(project);
    }

    this.renderGrid();
    this.renderGantt();
}
powerGantt.prototype.renderGrid = function () {
    let scaleHeight = this.config.scaleDefaultHeight
    let html = `<div class="power-ganttgrid-header">`;
    for (let i = 0; i < this.columns.length; i++) {
        html += `<div  class="power-ganttgrid-header-cell power-ganttgrid-cell" style="width:${this.columns[i].width || this.config.columnDefaultWidth}">${this.columns[i].text || ""}</div>`
    }
    html += `</div>`;

    for (let i = 0; i < this.data.length; i++) {
        let row = this.data[i];
        let level = row.level;
        html += `<div class="power-ganttgrid-row" style='height:${scaleHeight*level}px;line-height:${scaleHeight*level}px;'>`
        for (let j = 0; j < this.columns.length; j++) {
            html += `<div  class="power-ganttgrid-row-cell power-ganttgrid-cell" style="width:${this.columns[j].width || this.config.columnDefaultWidth}">${row[this.columns[j].field] || ""}</div>`
        }
        html += `</div>`;
    }

    this.ganttGrid.innerHTML = html;
}
powerGantt.prototype.renderGantt = function () {
    this.ganttView.innerHTML = '';
    let ganttViewHeader = document.createElement("div");
    ganttViewHeader.className = "power-ganttview-header"

    let ganttViewBody = document.createElement("div");
    ganttViewBody.className = "power-ganttview-body";
    this.ganttView.appendChild(ganttViewHeader);
    this.ganttView.appendChild(ganttViewBody);

    this.renderGanttHeader();
    this.renderGanttBody();
}
//gantt头部绘制
powerGantt.prototype.renderGanttHeader = function () {
    //month-day
    this.scalcColumnLength = 0;
    let scaleWidth = this.config.scaleDefautWidth;
    let topMode = this.config.ganttTopDateMode;
    let topTimeScale = `<div class="power-ganttview-toptimescale">`;
    let bottomTimeScale = `<div class="power-ganttview-bottomtimescale">`;
    let viewData = this.startDate;
    //可优化一天天加
    while (viewData < this.endDate) {
        let currentTimeScale = ``;
        let daysInMonth = moment(viewData).daysInMonth();
        let startDays = moment(viewData).date();
        for (let i = startDays; i <= daysInMonth; i++) {
            this.scalcColumnLength++;
            //let week= moment(viewData).date(1).day();
            let weekdd = moment(viewData).date(i).format('dd');
            currentTimeScale += `<div class="power-ganttview-headercell ${(weekdd=="六" || weekdd=="日")?"power-ganttview-offday":""}" style="width:${scaleWidth}px">${i}</div>`
        }
        bottomTimeScale += currentTimeScale;
        topTimeScale += `<div class="power-ganttview-headercell" style="width:${scaleWidth*(daysInMonth-startDays+1)}px">${moment(viewData).format(topMode)}</div>`
        viewData = moment(viewData).date(1).toDate();
        viewData = moment(viewData).add(1, 'month').toDate();
    }
    topTimeScale += `</div>`
    bottomTimeScale += `</div>`
    this.ganttView.children[0].innerHTML = topTimeScale + bottomTimeScale;
}
powerGantt.prototype.renderGanttBody = function () {
    let ganttGrid = this.renderGanttGrid();
    this.ganttView.children[1].appendChild(ganttGrid)

    let ganttTask = this.renderGanttTask();
    this.ganttView.children[1].appendChild(ganttTask)


}
//gantt表格绘制
powerGantt.prototype.renderGanttGrid = function () {
    let ganttGrid = document.createElement("div");
    ganttGrid.className = "power-ganttview-grid";
    //计算行、列数量
    let scaleWidth = this.config.scaleDefautWidth;
    let scaleHeight = this.config.scaleDefaultHeight;
    let rowLength = this.data.length;
    let columnLength = this.scalcColumnLength;
    let rowHeight = 0;

    for (let i = 0; i < rowLength; i++) {
        let level = this.data[i].level;

        let gridRow = document.createElement("div");
        gridRow.className = "power-ganttview-row";
        gridRow.style.top = rowHeight + "px";
        gridRow.style.width = columnLength * scaleWidth + "px";
        gridRow.style.height = scaleHeight * level + "px";
        rowHeight += scaleHeight * level;
        ganttGrid.appendChild(gridRow)

    }
    for (let l = 0; l < columnLength; l++) {
        let weekdd = moment(this.startDate).add(l, 'day').format('dd');;
        let gridColumn = document.createElement("div");
        gridColumn.className = "power-ganttview-column"
        if (weekdd == "六" || weekdd == "日") {
            gridColumn.classList.add("weeked");
        }
        gridColumn.style.left = l * scaleWidth + "px";
        gridColumn.style.width = scaleWidth + "px";
        gridColumn.style.height = rowHeight + "px";
        ganttGrid.appendChild(gridColumn)
    }

    return ganttGrid;
}
//gantt任务绘制
powerGantt.prototype.renderGanttTask = function () {
    let self = this;
    let scaleHeight = this.config.scaleDefaultHeight;
    let scaleWidth = this.config.scaleDefautWidth;
    let taskDomContainer = document.createElement("div");
    taskDomContainer.className = "power-ganttview-taskview"
    let taskTop = 0;
    for (var i = 0; i < this.data.length; i++) {
        var row = this.data[i];
        let rowLevelList = row.levelList;
        let projectRow = document.createElement("div");
        projectRow.className = "power-ganttview-project-row"

        for (let key in rowLevelList) {
            for (let j = 0; j < rowLevelList[key].length; j++) {
                let task = rowLevelList[key][j]
                let days = moment(task.end_date).diff(moment(task.start_date), 'days');
                let width = scaleWidth * days;
                let left = moment(task.start_date).diff(moment(this.startDate), 'days') * scaleWidth;
                let taskDom = document.createElement("div");
                taskDom.className = "power-ganttview-task";
                if (this.config.type === "resources") {
                    taskDom.classList.add("resources-view");
                    taskDom.setAttribute("title", task.name);
                }
                taskDom.style.left = left + "px";
                taskDom.style.top = taskTop + "px";
                taskDom.style.width = width + "px";
                taskDom.style.position = "absolute";
                projectRow.appendChild(taskDom);

                let userContent = document.createElement("div");

                if (this.config.type === "resources") {
                    userContent.className = "ganttview-block-project";
                    userContent.innerText = task.name
                } else {
                    userContent.className = "ganttview-block-user";
                }
                userContent.id = task.id;
                userContent.setAttribute("project-id", row.id);

                taskDom.appendChild(userContent);
                let reszieLeft = document.createElement("div");
                reszieLeft.className = "ui-resizable-handle ui-resizable-w";
                reszieLeft.style.zIndex = 90;

                let reszieRight = document.createElement("div");
                reszieRight.className = "ui-resizable-handle ui-resizable-e";
                reszieRight.style.zIndex = 90;
                taskDom.appendChild(reszieLeft);
                taskDom.appendChild(reszieRight);

                let startX = 0;
                taskDom.onmousedown = function (event) {
                    event.stopPropagation();
                    startX = event.x;
                    let _taskDom = this;
                    task._beforeLeft = _taskDom.offsetLeft;
                    document.onmousemove = function (event) {
                        event.stopPropagation();
                        self.dropTask(task, _taskDom, event.x - startX)
                    }
                    document.onmouseup = function (event) {
                        event.stopPropagation();
                        task.start_date = task._start_date.format('YYYY-MM-DD');
                        task.end_date = task._end_date.format('YYYY-MM-DD');
                        document.onmousemove = null;
                        document.onmouseup = null;
                        //重新render
                         self.render();

                    }

                }
                reszieRight.onmousedown = function (event) {
                    event.stopPropagation();
                    let _taskDom = this.parentNode;
                    startX = event.x;
                    task._beforeDays = moment(task.end_date).diff(moment(task.start_date), 'days');
                    document.onmousemove = function (event) {
                        event.stopPropagation();
                        self.updateTaskEndDate(task, _taskDom, event.x - startX)
                    }
                    document.onmouseup = function (event) {
                        event.stopPropagation();
                        task.end_date = task.end_date.format('YYYY-MM-DD');
                        document.onmousemove = null;
                        document.onmouseup = null;
                        //重新render
                        self.render();

                    }
                }

                reszieLeft.onmousedown = function (event) {
                    event.stopPropagation();
                    let _taskDom = this.parentNode;
                    startX = event.x;
                    task._beforeDays = moment(task.end_date).diff(moment(task.start_date), 'days');
                    task._beforeLeft = _taskDom.offsetLeft;
                    document.onmousemove = function (event) {
                        event.stopPropagation();
                        self.updateTaskStratDate(task, _taskDom, event.x - startX)
                    }
                    document.onmouseup = function (event) {
                        event.stopPropagation();
                        task.start_date = task.start_date.format('YYYY-MM-DD');
                        document.onmousemove = null;
                        document.onmouseup = null;
                        //重新render
                        self.render();

                    }
                }

                if (this.config.type === "project") {
                    for (var k = 0; k < task.resources.length; k++) {
                        this.createUserSpan(task.resources[k], task.id, row.id, userContent)

                    }

                }

            }
            taskTop += scaleHeight;
        }
        taskDomContainer.appendChild(projectRow)
    }
    return taskDomContainer;
}

powerGantt.prototype.updateTaskEndDate = function (task, taskDom, offsetX) {
    let scaleWidth = this.config.scaleDefautWidth;
    let afterDays = task._beforeDays + (Math.ceil(offsetX / scaleWidth));
    if (afterDays < 1) {
        afterDays = 1;
    }
    taskDom.style.width = afterDays * scaleWidth;
    task.end_date = moment(task.start_date).add(afterDays, 'day');
}
powerGantt.prototype.updateTaskStratDate = function (task, taskDom, offsetX) {
    let scaleWidth = this.config.scaleDefautWidth;
    let afterDays = task._beforeDays - (Math.ceil(offsetX / scaleWidth));
    if (afterDays < 1) {
        afterDays = 1;
    }
    console.log(afterDays)
    taskDom.style.left = task._beforeLeft + (task._beforeDays - afterDays) * scaleWidth;
    taskDom.style.width = afterDays * scaleWidth;
    task.start_date = moment(task.end_date).add(-afterDays, 'day');
}
powerGantt.prototype.dropTask = function (task, taskDom, offsetX) {
    let scaleWidth = this.config.scaleDefautWidth;
    let dropDays = (Math.ceil(offsetX / scaleWidth));
    taskDom.style.left = task._beforeLeft + dropDays * scaleWidth;
    task._start_date = moment(task.start_date).add(dropDays, 'day');
    task._end_date = moment(task.end_date).add(dropDays, 'day');
}

powerGantt.prototype.createUserSpan = function (user, taskId, projectId, container) {
    let userSpan = document.createElement("span");
    userSpan.className = "ganttview-user"
    userSpan.setAttribute("type", "user");
    userSpan.id = user.id;
    userSpan.onclick = this.userClick.bind(this, userSpan, user.id)
    let userIcon = document.createElement("i");
    userIcon.className = "fa fa-user"
    userSpan.appendChild(userIcon);
    userSpan.append(user.name)
    let removeIcon = document.createElement("a");
    removeIcon.className = "user-remove";
    removeIcon.text = "x";
    removeIcon.onclick = this.removeUser.bind(this, userSpan, user.id, taskId, projectId)
    userSpan.appendChild(removeIcon);
    container.appendChild(userSpan)
}
powerGantt.prototype.addUser = function (users, taskId, projectId, container) {
    let isChange = false;
    let addList = [];
    for (let i = 0; i < users.length; i++) {
        let user = users[i];
        let project = this.data.find(project => project.id == projectId);
        if (!project) {
            continue;
            // return false
        }
        let task = project.tasks.find(task => task.id == taskId);
        if (!task) {
            continue;
            // return false
        }
        let isAdd = task.resources.find(_user => _user.id == user.id);
        if (isAdd) {
            continue;
            // return false;
        }
        addList.push(user)
        isChange = true;
        task.resources.push(user);
        this.createUserSpan(user, taskId, projectId, container);
    }
    this.onUserChange(this.data, "add", addList)

}

powerGantt.prototype.removeUser = function (userDom, userId, taskId, projectId) {
    event.stopPropagation();
    userDom.remove();
    let project = this.data.find(project => project.id == projectId);
    if (!project) {
        return false
    }
    let task = project.tasks.find(task => task.id == taskId);
    if (!task) {
        return false
    }
    let index = task.resources.findIndex(user => user.id == userId);
    let user = task.resources.find(user => user.id == userId);
    task.resources.splice(index, 1);
    this.onUserChange(this.data, "delete", user);
    return false
}
powerGantt.prototype.userClick = function (userDom, userId) {
    alert(userDom.innerText);
    return false
}
powerGantt.prototype.toLevelData = function (data) {
    let levelList = {};
    for (let i = 0; i < data.tasks.length; i++) {
        let currentData = data.tasks[i];
        currentData.resources = currentData.resources || [];
        this.groupLevel(levelList, currentData, 0)
    }
    data.levelList = levelList;
    data.level = Object.keys(levelList).length;
}
powerGantt.prototype.groupLevel = function (levelList, task, level) {
    if (!levelList[level]) {
        levelList[level] = [];
        levelList[level].push(task);
        return;
    }
    let isCross = levelList[level].find(targetTask => {
        return (moment(task.start_date).valueOf() > moment(targetTask.start_date) && moment(task.start_date) < moment(targetTask.end_date)) || (moment(task.end_date).valueOf() > moment(targetTask.start_date) && moment(task.start_date) < moment(targetTask.end_date))
    }) ? true : false;
    if (isCross) {
        this.groupLevel(levelList, task, ++level)
    } else {
        levelList[level].push(task);
    }

}
powerGantt.prototype.setData = function (data) {
    this.data = data;
    //数据需要校验，过滤掉没有开始、结束日期的task
    this.startDate = '';
    this.endDate = '';
    //找出gantt的开始结束日期
    for (var i = 0; i < data.length; i++) {
        let projectTask = data[i].tasks;
        for (var j = 0; j < projectTask.length; j++) {
            let task = projectTask[j];
            if (!this.startDate) {
                this.startDate = task.start_date;
                this.endDate = task.end_date;
                continue;
            }
            this.startDate = moment(this.startDate).valueOf() > moment(task.start_date).valueOf() ? task.start_date : this.startDate;
            this.endDate = moment(this.endDate).valueOf() > moment(task.end_date).valueOf() ? this.endDate : task.end_date;

        }
    }
    this.startDate = moment(this.startDate).toDate();
    this.endDate = moment(this.endDate).toDate();
    this.render();

}
powerGantt.prototype.getData = function () {
    return this.data;
}
powerGantt.prototype.setColumn = function (columns) {
    this.columns = columns;
    this.renderGrid();

}
powerGantt.prototype.getColumn = function (columns) {
    return this.columns
}