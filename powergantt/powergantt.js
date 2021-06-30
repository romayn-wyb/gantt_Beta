moment.lang('zh-cn');
var powerGantt = function (element, config) {
    this.config = {
        width: "100%",
        height: "95%",
        columnDefaultWidth: "100px",
        scaleDefautWidth: 28,
        scaleDefaultHeight: 48,
        ganttTopDateMode: "YYYY年MM月",
        type: "project",
        initScrollTop: 0,
        initScrollLeft: 0,
        girdInitScrollLeft: 0,
        scrollTicking: false
    }
    this.data = [];
    this.columns = [];


    this.el = element;
    this.config = {
        ...this.config,
        ...config
    };
    // this.config = $.extend({}, this.config, config);
    this.init();
}
powerGantt.prototype.init = function () {
    let self = this;
    //初始化gantt结构和配置
    this.el.classList.add("power-gantt");
    // this.el.style.width = this.config.width;
    // this.el.style.height = this.config.height;
    this.el.style.position = "relative";

    this.ganttGrid = document.createElement("div");
    this.ganttGrid.innerHTML = "";
    this.ganttGrid.className = "power-ganttgrid"


    this.ganttView = document.createElement("div");
    this.ganttView.innerHTML = "";
    this.ganttView.className = "power-ganttview "
    this.el.appendChild(this.ganttGrid);
    this.el.appendChild(this.ganttView);
    this.render();
    this.scrollToNow();

    $(this.el).on("click", ".apply-name", function (event) {
        self.onNameClick.call(self, event, self.data.find(x => x.id == this.id))
    })
}


powerGantt.prototype.scrollToNow = function () {
    //render完滚动到活动试图
    let days = moment().add(-7, 'day').diff(this.startDate, 'days');
    this.ganttViewBody.scrollLeft = days * this.config.scaleDefautWidth;
}
powerGantt.prototype.render = function () {
    this.initScrollTop = 0;
    this.initScrollLeft = 0;
    //数据level处理
    this.startDate = moment().add(-7, 'day').format('L');
    this.endDate = moment().add(7, 'day').format('L');
    if (this.data.length) {
        //数据需要校验，过滤掉没有开始、结束日期的task
        // this.startDate = '';
        // this.endDate = '';
        //找出gantt的开始结束日期
        for (var i = 0; i < this.data.length; i++) {
            let projectTask = this.data[i].tasks;
            var project = this.data[i];
            //将项目截至日期也加入viewdate范围
            if (project.latest_date && (moment(this.startDate).valueOf() > moment(project.latest_date).valueOf())) {
                this.startDate = project.latest_date
            }
            if (project.latest_date && (moment(this.endDate).valueOf() < moment(project.latest_date).valueOf())) {
                this.endDate = project.latest_date
            }

            this.toLevelData(project);
            for (var j = 0; j < projectTask.length; j++) {
                let task = projectTask[j];
                if (!task.start_date && !task.end_date) {
                    continue;
                }
                if (!task.start_date) {
                    task.start_date = task.end_date;
                }
                if (!task.end_date) {
                    task.end_date = task.start_date;
                }

                this.startDate = moment(this.startDate).valueOf() > moment(task.start_date).valueOf() ? task.start_date : this.startDate;
                this.endDate = moment(this.endDate).valueOf() > moment(task.end_date).valueOf() ? this.endDate : task.end_date;

            }
        }


    }
    this.startDate = moment(this.startDate).toDate();
    this.endDate = moment(this.endDate).toDate();

    this.renderGrid();
    this.renderGantt();



}
powerGantt.prototype.renderGrid = function () {
    let self = this;
    this.ganttGrid.innerHTML = '';
    let scaleHeight = this.config.scaleDefaultHeight
    let left = 0;
    self.ganttgridHeader = document.createElement("div");
    self.ganttgridHeader.className = "power-ganttgrid-header"
    // let html = `<div class="power-ganttgrid-header">`;
    for (let i = 0; i < this.columns.length; i++) {
        let headercell = document.createElement("div");
        headercell.className = "power-ganttgrid-header-cell power-ganttgrid-cell"
        headercell.style.left = left;
        let width = this.columns[i].width || this.config.columnDefaultWidth;
        headercell.style.width = width;
        headercell.style.left = left;
        headercell.innerHTML = this.columns[i].text || ""
        // html += `<div  class="power-ganttgrid-header-cell power-ganttgrid-cell" style="left:${left}px;width:${this.columns[i].width || this.config.columnDefaultWidth}">${this.columns[i].text || ""}</div>`
        left += parseInt(width);
      
        self.ganttgridHeader.appendChild(headercell)
    }
    let gutter= document.createElement("div");
    gutter.className="gutter";
    gutter.style.width="17px";
    gutter.style.left=left;
    self.ganttgridHeader.appendChild(gutter);

    // html += `</div>`;
     self.ganttgridBody = document.createElement("div");
    self.ganttgridBody.className = "power-ganttgrid-body"
    // html += `<div class="power-ganttgrid-body">`
    for (let i = 0; i < this.data.length; i++) {
        let row = this.data[i];
        let level = row.level;
        let ganttgridRow = document.createElement("div");
        ganttgridRow.className = "power-ganttgrid-row"
        ganttgridRow.style.height = `${scaleHeight * level}px`
        ganttgridRow.style.lineHeight = `${scaleHeight * level}px`
        // html += `<div class="power-ganttgrid-row" style='height:${scaleHeight * level}px;line-height:${scaleHeight * level}px;'>`
        for (let j = 0; j < this.columns.length; j++) {
            let ganttgridCell = document.createElement("div");
            ganttgridCell.className = "power-ganttgrid-row-cell power-ganttgrid-cell"
            ganttgridCell.style.width = this.columns[j].width || this.config.columnDefaultWidth
            if (columns[j].field == "applyName") {
                let a = document.createElement("a");
                a.id = row.id;
                a.className = "apply-name"
                a.innerHTML = row[this.columns[j].field] || ""
                ganttgridCell.appendChild(a);
                // html += `<div  class="power-ganttgrid-row-cell power-ganttgrid-cell " style="width:${this.columns[j].width || this.config.columnDefaultWidth}"><a id="${row.id}" class="apply-name">${row[this.columns[j].field] || ""}</a></div>`
            } else {
                // html += `<div  class="power-ganttgrid-row-cell power-ganttgrid-cell" style="width:${this.columns[j].width || this.config.columnDefaultWidth}">${row[this.columns[j].field] || ""}</div>`
                ganttgridCell.innerHTML = row[this.columns[j].field] || ""
            }
            ganttgridRow.appendChild(ganttgridCell)
        }
        self.ganttgridBody.appendChild(ganttgridRow)
        // html += `</div>`;
    }
    // html += `</div>`
    // this.ganttGrid.innerHTML = html;
    this.ganttGrid.appendChild(self.ganttgridHeader);
    this.ganttGrid.appendChild(self.ganttgridBody);

    self.ganttgridBody.onscroll = function (event) {
        //上下滚动
        _ganttViewBody = this;
        if (this.scrollTop != self.initScrollTop) {
            if (!self.scrollTicking) {
                requestAnimationFrame(function () {
                    self.initScrollTop = _ganttViewBody.scrollTop;
                    self.ganttViewBody.scrollTop = _ganttViewBody.scrollTop;
                    self.scrollTicking = false;
                });
                self.scrollTicking = true;
            }
        }
        if (this.scrollLeft != self.girdInitScrollLeft) {
            console.log(this.scrollLeft)
            self.girdInitScrollLeft = this.scrollLeft;
            self.ganttgridHeader.scrollLeft = this.scrollLeft;
        }
    }

}
powerGantt.prototype.renderGantt = function () {
    let self = this;
    self.ganttView.innerHTML = '';
    self.ganttViewHeader = document.createElement("div");
    self.ganttViewHeader.className = "power-ganttview-header"
    self.ganttViewBody = document.createElement("div");
    self.ganttViewBody.className = "power-ganttview-body";
    self.ganttView.appendChild(self.ganttViewHeader);
    self.ganttView.appendChild(self.ganttViewBody);

    self.ganttViewBody.onscroll = function (event) {
        //上下滚动
        let _ganttViewBody = this;
        if (this.scrollTop != self.initScrollTop) {
            if (!self.scrollTicking) {
                requestAnimationFrame(function () {
                    self.initScrollTop = _ganttViewBody.scrollTop;
                    self.ganttgridBody.scrollTop = _ganttViewBody.scrollTop;
                    self.scrollTicking = false;
                });
                self.scrollTicking = true;
            }
        }
        if (this.scrollLeft != self.initScrollLeft) {
            self.initScrollLeft = _ganttViewBody.scrollLeft;
            self.ganttViewHeader.scrollLeft = _ganttViewBody.scrollLeft;
        }
    }

    self.renderGanttHeader();
    self.renderGanttBody();
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
    let left = 0;
    //可优化一天天加
    while (viewData <= this.endDate) {
        let currentTimeScale = ``;
        let daysInMonth = moment(viewData).daysInMonth();
        let startDays = moment(viewData).date();
        for (let i = startDays; i <= daysInMonth; i++) {
            this.scalcColumnLength++;
            //let week= moment(viewData).date(1).day();
            let weekdd = moment(viewData).date(i).days();
            currentTimeScale += `<div class="power-ganttview-headercell ${(weekdd == "6" || weekdd == "0") ? "power-ganttview-offday" : ""}" style="width:${scaleWidth}px">${i}</div>`
        }
        bottomTimeScale += currentTimeScale;
        topTimeScale += `<div class="power-ganttview-headercell" style="left:${left}px;width:${scaleWidth * (daysInMonth - startDays + 1)}px">${moment(viewData).format(topMode)}</div>`
        left += scaleWidth * (daysInMonth - startDays + 1)
        viewData = moment(viewData).date(1).toDate();
        viewData = moment(viewData).add(1, 'month').toDate();
    }
    topTimeScale += `</div>`
    bottomTimeScale += `</div>`
    let gutter=`<div class='gutter' style='left:${left}px;width:17px'></div>`
    this.ganttView.children[0].innerHTML = topTimeScale + bottomTimeScale+gutter;

    //
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
        let weekdd = moment(this.startDate).add(l, 'day').days();;
        let gridColumn = document.createElement("div");
        gridColumn.className = "power-ganttview-column"
        if (weekdd == "6" || weekdd == "0") {
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
    let levelTop = 0;
    let lineTop = 0;
    for (var i = 0; i < this.data.length; i++) {
        var row = this.data[i];
        let rowLevelList = row.levelList;
        let projectRow = document.createElement("div");
        projectRow.className = "power-ganttview-project-row"


        for (let key in rowLevelList) {
            for (let j = 0; j < rowLevelList[key].length; j++) {
                let task = rowLevelList[key][j]
                let days = moment(task.end_date).diff(moment(task.start_date), 'days') + 1;
                let width = scaleWidth * days;
                let left = moment(task.start_date).diff(moment(this.startDate), 'days') * scaleWidth;
                let taskDom = document.createElement("div");
                taskDom.className = "power-ganttview-task";
                taskDom.setAttribute("title", task.name);
                if (this.config.type === "resources") {
                    taskDom.classList.add("resources-view");

                }
                taskDom.style.left = left + "px";
                taskDom.style.top = levelTop + "px";
                taskDom.style.width = width + "px";
                taskDom.style.position = "absolute";
                taskDom.ondblclick = this.onTaskDblClick.bind(this, taskDom, task);
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

                let taksName = document.createElement("div");
                taksName.className = "ganttview-block-text";
                // taksName.setAttribute("title", task.name);
                taksName.innerText = task.name;
                taskDom.appendChild(taksName);
                // taksName.onclick=this.onTextClick.bind(this,task)
                let startX = 0;
                taskDom.onmousedown = function (event) {
                    if (!$(event.target).hasClass("ganttview-block-user") && !$(event.target).hasClass("ganttview-block-text")) {
                        return
                    }
                    console.log("onmousedown")
                    event.stopPropagation();
                    startX = event.x;
                    let _taskDom = this;
                    task._beforeLeft = _taskDom.offsetLeft;

                    document.onmousemove = function (event) {
                        event.stopPropagation();
                        self.dropTask(task, _taskDom, event.x - startX);
                        console.log("onmousemove")
                    }

                    document.onmouseup = function (event) {
                        console.log("onmouseup")
                        event.stopPropagation();
                        document.onmousemove = null;
                        document.onmouseup = null;
                        // taskDom.onmousedown = null;
                        if (!task._start_date || !task._end_date) {
                            return;
                        }
                        // 判断时候超出界限
                        if (task._end_date > self.endDate) {
                            self.endDate = task._end_date;
                        }
                        if (task._start_date < self.startDate) {
                            self.startDate = task._start_date;
                        }
                        task.start_date = task._start_date.format('YYYY-MM-DD');
                        task.end_date = task._end_date.format('YYYY-MM-DD');
                        task._start_date = '';
                        task._end_date = '';
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
                        // 判断时候超出界限
                        if (task.end_date > self.endDate) {
                            self.endDate = task.end_date;
                        }

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
                        // 判断时候超出界限
                        if (task.start_date < self.startDate) {
                            self.startDate = task.start_date;
                        }

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
            levelTop += scaleHeight;
        }
        //添加最晚时间线
        if (row.latest_date) {
            let left = (moment(row.latest_date).diff(moment(this.startDate), 'days') + 1) * scaleWidth;
            let lastLine = document.createElement("div");
            lastLine.className = "power-ganttview-laseLine";
            lastLine.style.background = "red";
            lastLine.style.left = left + "px";
            lastLine.style.top = taskTop + "px";
            lastLine.style.width = "2px";
            lastLine.style.marginLeft = "-1.5px";
            lastLine.style.position = "absolute";
            lastLine.style.height = (row.level * scaleHeight) + "px";
            projectRow.appendChild(lastLine);
        }
        taskTop += row.level * scaleHeight;
        levelTop = taskTop;
        taskDomContainer.appendChild(projectRow)
    }
    return taskDomContainer;
}

powerGantt.prototype.updateTaskEndDate = function (task, taskDom, offsetX) {
    let scaleWidth = this.config.scaleDefautWidth;
    let afterDays = task._beforeDays + (Math.ceil(offsetX / scaleWidth));
    if (afterDays < 0) {
        afterDays = 0;
    }
    taskDom.style.width = (afterDays + 1) * scaleWidth;
    task.end_date = moment(task.start_date).add(afterDays, 'day');
}
powerGantt.prototype.updateTaskStratDate = function (task, taskDom, offsetX) {
    let scaleWidth = this.config.scaleDefautWidth;
    let afterDays = task._beforeDays - (Math.ceil(offsetX / scaleWidth));
    if (afterDays < -1) {
        afterDays = -1;
    }
    console.log(afterDays)
    taskDom.style.left = task._beforeLeft + (task._beforeDays - afterDays - 1) * scaleWidth;
    taskDom.style.width = (afterDays + 2) * scaleWidth;
    task.start_date = moment(task.end_date).add(-afterDays - 1, 'day');
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
    userSpan.setAttribute("title", user.name);
    userSpan.id = user.id;
    userSpan.onclick = this.userClick.bind(this, userSpan, user.id);

    let removeIcon = document.createElement("a");
    removeIcon.className = "user-remove";
    removeIcon.text = "x";
    removeIcon.onclick = this.removeUser.bind(this, userSpan, user.id, taskId, projectId)
    userSpan.appendChild(removeIcon);

    let userIcon = document.createElement("i");
    if (user.icon) {
        userSpan.appendChild($(user.icon).clone(true, true)[0]);
    } else if (user.type == "EQUI") {
        userIcon.className = "fa fa-camera-retro";
        userSpan.appendChild(userIcon);
    } else if (user.type == "dutyer") {
        userIcon.className = "fa fa-flag";
        userIcon.style.color = "red";
        userSpan.appendChild(userIcon);
    } else {
        userIcon.className = "fa fa-user";
        userSpan.appendChild(userIcon);
    }
    let userText = document.createElement("span");
    userText.innerText = user.name;
    userSpan.appendChild(userText)

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
    document.onmousemove = null;
    document.onmouseup = null;
    return false
}

powerGantt.prototype.on = function (event, callback) {
    let eventName = "on" + event.replace(event[0], event[0].toUpperCase());
    this[eventName] = callback.bind(this);
}
powerGantt.prototype.onNameClick = function (data) {
    console.log(data)
    return false
}
powerGantt.prototype.onTaskDblClick = function (event, task) {
    console.log(task)
    return false
}

powerGantt.prototype.onTaskDbChange = function (task) {
    console.log(userId)
    return false
}

powerGantt.prototype.onUserChange = function (userDom, userId) {
    console.log(userId)
    return false
}
powerGantt.prototype.userClick = function (userDom, userId) {
    console.log(userId)
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
    //层级最少为1
    data.level = Object.keys(levelList).length || 1;
}
powerGantt.prototype.groupLevel = function (levelList, task, level) {
    if (!levelList[level]) {
        levelList[level] = [];
        levelList[level].push(task);
        return;
    }
    let isCross = levelList[level].find(targetTask => {
        return (moment(task.start_date).valueOf() >= moment(targetTask.start_date) && moment(task.start_date) <= moment(targetTask.end_date)) || (moment(task.end_date).valueOf() >= moment(targetTask.start_date) && moment(task.start_date) <= moment(targetTask.end_date))
    }) ? true : false;
    if (isCross) {
        this.groupLevel(levelList, task, ++level)
    } else {
        levelList[level].push(task);
    }

}
powerGantt.prototype.setData = function (data) {
    this.data = data;
    this.render();
    this.scrollToNow();
}
powerGantt.prototype.getData = function () {
    return this.data;
}
powerGantt.prototype.setColumn = function (columns) {
    this.columns = columns;
    this.renderGrid();

}
powerGantt.prototype.getColumn = function () {
    return this.columns
}