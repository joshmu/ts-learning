// validator
interface Validatable {
  value: string | number
  required?: boolean
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
}

function validate(validataleInput: Validatable): boolean {
  let isValid = true
  if (validataleInput.required) {
    isValid = isValid && validataleInput.value.toString().trim().length !== 0
  }
  if (
    validataleInput.minLength != null &&
    typeof validataleInput.value === 'string'
  ) {
    isValid =
      isValid && validataleInput.value.length >= validataleInput.minLength
  }
  if (
    validataleInput.maxLength != null &&
    typeof validataleInput.value === 'string'
  ) {
    isValid =
      isValid && validataleInput.value.length <= validataleInput.maxLength
  }
  if (
    validataleInput.min != null &&
    typeof validataleInput.value === 'number'
  ) {
    isValid = isValid && validataleInput.value >= validataleInput.min
  }
  if (
    validataleInput.max != null &&
    typeof validataleInput.value === 'number'
  ) {
    isValid = isValid && validataleInput.value <= validataleInput.max
  }

  return isValid
}

// autobind decorator
function autobind(
  target: any,
  methodName: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value
  const adjustedDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFn = originalMethod.bind(this)
      return boundFn
    },
  }
  return adjustedDescriptor
}

// ProjectList Class
class ProjectList {
  templateElement: HTMLTemplateElement
  hostElement: HTMLDivElement
  element: HTMLElement
  assignedProjects: any[]

  constructor(private type: 'active' | 'finished') {
    this.templateElement = document.getElementById(
      'project-list'
    )! as HTMLTemplateElement
    this.hostElement = document.getElementById('app')! as HTMLDivElement
    this.assignedProjects = []

    const importedNode = document.importNode(this.templateElement.content, true)
    this.element = importedNode.firstElementChild! as HTMLElement
    this.element.id = `${this.type}-projects`

    prjState.addListener((projects: any[]) => {
      this.assignedProjects = projects
      this.renderProjects()
    })

    this.attach()
    this.renderContent()
  }

  private renderProjects() {
    const listElem = document.getElementById(
      `${this.type}-projects-list`
    )! as HTMLUListElement
    this.assignedProjects.forEach(prjItem => {
      const listItem = document.createElement('li')
      listItem.textContent = prjItem.title
      listElem.appendChild(listItem)
    })
  }

  private renderContent() {
    const listId = `${this.type}-projects-list`
    this.element.querySelector('ul')!.id = listId
    this.element.querySelector('h2')!.textContent =
      this.type.toUpperCase() + ' PROJECTS'
  }

  private attach() {
    this.hostElement.insertAdjacentElement('beforeend', this.element)
  }
}

// ProjectInput Class
class ProjectInput {
  templateElement: HTMLTemplateElement
  hostElement: HTMLDivElement
  element: HTMLFormElement
  titleInputElement: HTMLInputElement
  descriptionInputElement: HTMLInputElement
  peopleInputElement: HTMLInputElement

  constructor() {
    this.templateElement = document.getElementById(
      'project-input'
    )! as HTMLTemplateElement
    this.hostElement = document.getElementById('app')! as HTMLDivElement

    const importedNode = document.importNode(this.templateElement.content, true)
    this.element = importedNode.firstElementChild! as HTMLFormElement
    this.element.id = 'user-input'

    this.titleInputElement = this.element.querySelector(
      '#title'
    )! as HTMLInputElement
    this.descriptionInputElement = this.element.querySelector(
      '#description'
    )! as HTMLInputElement
    this.peopleInputElement = this.element.querySelector(
      '#people'
    )! as HTMLInputElement

    this.configure()
    this.attach()
  }

  private gatherUserInput(): [string, string, number] | void {
    const title = this.titleInputElement.value
    const description = this.descriptionInputElement.value
    const people = this.peopleInputElement.value

    const titleValidatable: Validatable = {
      value: title,
      required: true,
    }
    const descValidatable: Validatable = {
      value: description,
      required: true,
      minLength: 5,
    }
    const peopleValidatable: Validatable = {
      value: +people,
      required: true,
      min: 1,
      max: 5,
    }

    if (
      !validate(titleValidatable) ||
      !validate(descValidatable) ||
      !validate(peopleValidatable)
    ) {
      alert('Invalid input please try again.')
      return
    } else {
      return [title, description, +people]
    }
  }

  private clearInputs() {
    this.titleInputElement.value = ''
    this.descriptionInputElement.value = ''
    this.peopleInputElement.value = ''
  }

  @autobind
  private submitHandler(event: Event) {
    event.preventDefault()
    const userInput = this.gatherUserInput()
    if (Array.isArray(userInput)) {
      const [title, desc, people] = userInput
      prjState.addProject(title, desc, people)
      this.clearInputs()
    }
  }

  private configure() {
    this.element.addEventListener('submit', this.submitHandler)
  }

  private attach() {
    this.hostElement.insertAdjacentElement('afterbegin', this.element)
  }
}

// Project State Management
class ProjectState {
  listeners: any[] = []
  projects: any[] = []
  private static instance: ProjectState

  private constructor() {}

  static getInstance() {
    if (!this.instance) this.instance = new ProjectState()
    return this.instance
  }

  addListener(listernerFn: Function) {
    this.listeners.push(listernerFn)
  }

  addProject(title: string, description: string, people: number) {
    const newProject = {
      title,
      description,
      people,
    }
    this.projects.push(newProject)
    this.listeners.forEach(listenerFn => {
      listenerFn([...this.projects])
    })
  }
}

const prjState = ProjectState.getInstance()
const prjInput = new ProjectInput()
const activePrjList = new ProjectList('active')
const finishedPrjList = new ProjectList('finished')
