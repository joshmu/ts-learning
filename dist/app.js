"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
function validate(validataleInput) {
    var isValid = true;
    if (validataleInput.required) {
        isValid = isValid && validataleInput.value.toString().trim().length !== 0;
    }
    if (validataleInput.minLength != null &&
        typeof validataleInput.value === 'string') {
        isValid =
            isValid && validataleInput.value.length >= validataleInput.minLength;
    }
    if (validataleInput.maxLength != null &&
        typeof validataleInput.value === 'string') {
        isValid =
            isValid && validataleInput.value.length <= validataleInput.maxLength;
    }
    if (validataleInput.min != null &&
        typeof validataleInput.value === 'number') {
        isValid = isValid && validataleInput.value >= validataleInput.min;
    }
    if (validataleInput.max != null &&
        typeof validataleInput.value === 'number') {
        isValid = isValid && validataleInput.value <= validataleInput.max;
    }
    return isValid;
}
// autobind decorator
function autobind(target, methodName, descriptor) {
    var originalMethod = descriptor.value;
    var adjustedDescriptor = {
        configurable: true,
        get: function () {
            var boundFn = originalMethod.bind(this);
            return boundFn;
        },
    };
    return adjustedDescriptor;
}
// ProjectList Class
var ProjectList = /** @class */ (function () {
    function ProjectList(type) {
        var _this = this;
        this.type = type;
        this.templateElement = document.getElementById('project-list');
        this.hostElement = document.getElementById('app');
        this.assignedProjects = [];
        var importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild;
        this.element.id = this.type + "-projects";
        prjState.addListener(function (projects) {
            _this.assignedProjects = projects;
            _this.renderProjects();
        });
        this.attach();
        this.renderContent();
    }
    ProjectList.prototype.renderProjects = function () {
        var listElem = document.getElementById(this.type + "-projects-list");
        this.clearContent();
        this.assignedProjects.forEach(function (prjItem) {
            var listItem = document.createElement('li');
            listItem.textContent = prjItem.title;
            listElem.appendChild(listItem);
        });
    };
    ProjectList.prototype.clearContent = function () {
        var listElem = document.getElementById(this.type + "-projects-list");
        listElem.innerHTML = '';
    };
    ProjectList.prototype.renderContent = function () {
        var listId = this.type + "-projects-list";
        this.element.querySelector('ul').id = listId;
        this.element.querySelector('h2').textContent =
            this.type.toUpperCase() + ' PROJECTS';
    };
    ProjectList.prototype.attach = function () {
        this.hostElement.insertAdjacentElement('beforeend', this.element);
    };
    return ProjectList;
}());
// ProjectInput Class
var ProjectInput = /** @class */ (function () {
    function ProjectInput() {
        this.templateElement = document.getElementById('project-input');
        this.hostElement = document.getElementById('app');
        var importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild;
        this.element.id = 'user-input';
        this.titleInputElement = this.element.querySelector('#title');
        this.descriptionInputElement = this.element.querySelector('#description');
        this.peopleInputElement = this.element.querySelector('#people');
        this.configure();
        this.attach();
    }
    ProjectInput.prototype.gatherUserInput = function () {
        var title = this.titleInputElement.value;
        var description = this.descriptionInputElement.value;
        var people = this.peopleInputElement.value;
        var titleValidatable = {
            value: title,
            required: true,
        };
        var descValidatable = {
            value: description,
            required: true,
            minLength: 5,
        };
        var peopleValidatable = {
            value: +people,
            required: true,
            min: 1,
            max: 5,
        };
        if (!validate(titleValidatable) ||
            !validate(descValidatable) ||
            !validate(peopleValidatable)) {
            alert('Invalid input please try again.');
            return;
        }
        else {
            return [title, description, +people];
        }
    };
    ProjectInput.prototype.clearInputs = function () {
        this.titleInputElement.value = '';
        this.descriptionInputElement.value = '';
        this.peopleInputElement.value = '';
    };
    ProjectInput.prototype.submitHandler = function (event) {
        event.preventDefault();
        var userInput = this.gatherUserInput();
        if (Array.isArray(userInput)) {
            var title = userInput[0], desc = userInput[1], people = userInput[2];
            prjState.addProject(title, desc, people);
            this.clearInputs();
        }
    };
    ProjectInput.prototype.configure = function () {
        this.element.addEventListener('submit', this.submitHandler);
    };
    ProjectInput.prototype.attach = function () {
        this.hostElement.insertAdjacentElement('afterbegin', this.element);
    };
    __decorate([
        autobind
    ], ProjectInput.prototype, "submitHandler", null);
    return ProjectInput;
}());
// Project State Management
var ProjectState = /** @class */ (function () {
    function ProjectState() {
        this.listeners = [];
        this.projects = [];
    }
    ProjectState.getInstance = function () {
        if (!this.instance)
            this.instance = new ProjectState();
        return this.instance;
    };
    ProjectState.prototype.addListener = function (listernerFn) {
        this.listeners.push(listernerFn);
    };
    ProjectState.prototype.addProject = function (title, description, people) {
        var _this = this;
        var newProject = {
            title: title,
            description: description,
            people: people,
        };
        this.projects.push(newProject);
        this.listeners.forEach(function (listenerFn) {
            listenerFn(__spreadArrays(_this.projects));
        });
    };
    return ProjectState;
}());
var prjState = ProjectState.getInstance();
var prjInput = new ProjectInput();
var activePrjList = new ProjectList('active');
var finishedPrjList = new ProjectList('finished');
//# sourceMappingURL=app.js.map