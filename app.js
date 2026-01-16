// Electron integration helpers
const isElectron = typeof window !== 'undefined' && !!window.electronAPI;
let appPaths = {
  appPath: null,
  dataPath: null,
  projectsPath: null,
  csvFile: null
};

async function initializeElectronPaths() {
  if (!isElectron) return;
  try {
    const paths = await window.electronAPI.getPaths();
    appPaths = paths;
    const currentDataPathEl = document.getElementById('currentDataPath');
    if (currentDataPathEl && paths.dataPath) {
      currentDataPathEl.textContent = paths.dataPath;
    }
  } catch (e) {
    console.error('Failed to load Electron paths', e);
  }
}

// End Electron helpers

// State management (in-memory)
let appState = {
  projects: [],
  templates: [],
  currentView: 'projects',
  currentProject: null,
  currentStage: null,
  currentTemplate: null,
  lastModified: null,
  pendingProjectImport: null
};

// Initialize with sample data
function initializeApp() {
  appState.projects = [
    {
      id: "proj_1",
      name: "Website Redesign",
      owner: "John Smith",
      budget: "50000",
      startDate: "2025-01-15",
      description: "Complete website redesign project",
      stages: [
        {
          name: "Planning",
          status: "completed",
          completionDate: "2025-02-01",
          tasks: [
            {
              id: "t1",
              name: "Define requirements",
              completed: true,
              assignedTo: "John Smith",
              dueDate: "2025-01-20",
              createdBy: "Admin"
            },
            {
              id: "t2",
              name: "Create project timeline",
              completed: true,
              assignedTo: "Sarah Johnson",
              dueDate: "2025-01-22",
              createdBy: "Admin"
            }
          ],
          updates: [
            {
              id: "u1",
              text: "Requirements document completed and approved",
              timestamp: "2025-01-21T10:30:00",
              taskId: "t1"
            },
            {
              id: "u2",
              text: "Timeline finalized with all stakeholders",
              timestamp: "2025-01-23T14:00:00",
              taskId: "t2"
            },
            {
              id: "u3",
              text: "Planning phase wrap-up meeting held",
              timestamp: "2025-02-01T09:00:00",
              taskId: null
            }
          ],
          files: []
        },
        {
          name: "Design",
          status: "in-progress",
          completionDate: null,
          tasks: [
            {
              id: "t3",
              name: "Create wireframes",
              completed: false,
              assignedTo: "Sarah Johnson",
              dueDate: "2025-02-15",
              createdBy: "Admin"
            },
            {
              id: "t4",
              name: "Design mockups",
              completed: false,
              assignedTo: "Mike Chen",
              dueDate: "2025-02-20",
              createdBy: "Admin"
            }
          ],
          updates: [
            {
              id: "u4",
              text: "Started working on homepage wireframes",
              timestamp: "2025-02-05T11:00:00",
              taskId: "t3"
            }
          ],
          files: [
            {
              id: "f1",
              name: "wireframe_v1.pdf",
              path: "./projects/proj_1_Website_Redesign/stage_1_Design/wireframe_v1.pdf",
              uploadDate: "2025-02-06T10:00:00",
              size: 2048000
            }
          ]
        },
        {
          name: "Development",
          status: "not-started",
          completionDate: null,
          tasks: [],
          updates: [],
          files: []
        },
        {
          name: "Testing",
          status: "not-started",
          completionDate: null,
          tasks: [],
          updates: [],
          files: []
        },
        {
          name: "Deployment",
          status: "not-started",
          completionDate: null,
          tasks: [],
          updates: [],
          files: []
        }
      ]
    },
    {
      id: "proj_2",
      name: "Marketing Campaign Q1",
      owner: "Emma Davis",
      budget: "25000",
      startDate: "2025-02-01",
      description: "Q1 2025 marketing campaign launch",
      stages: [
        {
          name: "Research",
          status: "completed",
          completionDate: "2025-02-10",
          tasks: [
            {
              id: "t5",
              name: "Market analysis",
              completed: true,
              assignedTo: "Emma Davis",
              dueDate: "2025-02-08",
              createdBy: "Admin"
            }
          ],
          updates: [
            {
              id: "u5",
              text: "Market research report completed",
              timestamp: "2025-02-08T16:00:00",
              taskId: "t5"
            }
          ],
          files: []
        },
        {
          name: "Strategy",
          status: "in-progress",
          completionDate: null,
          tasks: [
            {
              id: "t6",
              name: "Define target audience",
              completed: true,
              assignedTo: "Emma Davis",
              dueDate: "2025-02-15",
              createdBy: "Admin"
            },
            {
              id: "t7",
              name: "Create messaging framework",
              completed: false,
              assignedTo: "Tom Wilson",
              dueDate: "2025-02-18",
              createdBy: "Admin"
            }
          ],
          updates: [
            {
              id: "u6",
              text: "Target audience personas defined",
              timestamp: "2025-02-14T10:00:00",
              taskId: "t6"
            }
          ],
          files: []
        },
        {
          name: "Content Creation",
          status: "not-started",
          completionDate: null,
          tasks: [],
          updates: [],
          files: []
        },
        {
          name: "Launch",
          status: "not-started",
          completionDate: null,
          tasks: [],
          updates: [],
          files: []
        }
      ]
    }
  ];

  appState.templates = [
    {
      id: "template_1",
      name: "Software Development",
      stages: ["Planning", "Design", "Development", "Testing", "Deployment"]
    },
    {
      id: "template_2",
      name: "Marketing Campaign",
      stages: ["Research", "Strategy", "Content Creation", "Launch", "Analysis"]
    },
    {
      id: "template_3",
      name: "Product Launch",
      stages: ["Concept", "Development", "Beta Testing", "Marketing", "Launch", "Post-Launch"]
    }
  ];

  setupEventListeners();
  renderProjects();
  startAutoExport();
}

// Setup event listeners
function setupEventListeners() {
  // Navigation
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const view = e.target.dataset.view;
      if (view) {
        switchView(view);
      }
    });
  });

  // Chart modal
  const closeChartModal = document.getElementById('closeChartModal');
  if (closeChartModal) closeChartModal.addEventListener('click', () => closeModal('chartModal'));

  // Settings
  const settingsBtn = document.getElementById('settingsBtn');
  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => openModal('settingsModal'));
  }
  const closeSettingsBtn = document.getElementById('closeSettingsModal');
  if (closeSettingsBtn) {
    closeSettingsBtn.addEventListener('click', () => closeModal('settingsModal'));
  }

  const changeDataLocationBtn = document.getElementById('changeDataLocationBtn');
  if (changeDataLocationBtn && isElectron) {
    changeDataLocationBtn.addEventListener('click', async () => {
      const result = await window.electronAPI.changeDataLocation();
      if (result && result.success && result.newPath) {
        appPaths.dataPath = result.newPath;
        const currentDataPathEl = document.getElementById('currentDataPath');
        if (currentDataPathEl) {
          currentDataPathEl.textContent = result.newPath;
        }
      } else if (result && result.error) {
        alert('Could not change data location: ' + result.error);
      }
    });
  }

  const openDataFolderBtn = document.getElementById('openDataFolderBtn');
  if (openDataFolderBtn && isElectron) {
    openDataFolderBtn.addEventListener('click', () => {
      window.electronAPI.openFolder('data');
    });
  }

  const exportCsvBtn = document.getElementById('exportCsvBtn');
  if (exportCsvBtn) {
    exportCsvBtn.addEventListener('click', exportToCSV);
  }
  const importCsvBtn = document.getElementById('importCsvBtn');
  if (importCsvBtn) {
    importCsvBtn.addEventListener('click', handleImportCsv);
  }
  const importStageCsvBtn = document.getElementById('importStageCsvBtn');
  if (importStageCsvBtn) importStageCsvBtn.addEventListener('click', importStageTaskChecklistCsv);

  // Export button (legacy)

  document.getElementById('exportBtn').addEventListener('click', exportToCSV);

  // Add project button
  document.getElementById('addProjectBtn').addEventListener('click', openAddProjectModal);

  // Add template button
  document.getElementById('addTemplateBtn').addEventListener('click', openAddTemplateModal);

  // Project modal
  document.getElementById('closeProjectModal').addEventListener('click', () => closeModal('projectModal'));
  document.getElementById('saveProjectBtn').addEventListener('click', saveProject);

  // Project import (within project modal)
  const projectImportBtn = document.getElementById('projectImportCsvBtn');
  if (projectImportBtn) projectImportBtn.addEventListener('click', chooseProjectImportCsv);
  const projectClearImportBtn = document.getElementById('projectClearImportBtn');
  if (projectClearImportBtn) projectClearImportBtn.addEventListener('click', clearProjectImportSelection);


  const projectPreviewImportBtn = document.getElementById('projectPreviewImportBtn');
  if (projectPreviewImportBtn) projectPreviewImportBtn.addEventListener('click', openImportPreviewModal);

  const projectImportMode = document.getElementById('projectImportMode');
  if (projectImportMode) {
    projectImportMode.addEventListener('change', () => {
      if (appState.pendingProjectImport) {
        appState.pendingProjectImport.mode = projectImportMode.value;
        updateProjectImportSummary();
      }
    });
  }

  const closeImportPreviewModal = document.getElementById('closeImportPreviewModal');
  if (closeImportPreviewModal) closeImportPreviewModal.addEventListener('click', () => closeModal('importPreviewModal'));
  const closeImportPreviewBtn = document.getElementById('closeImportPreviewBtn');
  if (closeImportPreviewBtn) closeImportPreviewBtn.addEventListener('click', () => closeModal('importPreviewModal'));



  document.getElementById('deleteProjectBtn').addEventListener('click', deleteProject);

  // Stage modal
  document.getElementById('closeStageModal').addEventListener('click', () => closeModal('stageModal'));
  document.getElementById('stageStatus').addEventListener('change', handleStageStatusChange);
  document.getElementById('stageCompletionDate').addEventListener('change', handleStageCompletionDateChange);

  // Modal tabs
  document.querySelectorAll('.modal-tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tab = e.target.dataset.tab;
      switchModalTab(tab);
    });
  });

  // Tasks
  document.getElementById('addTaskBtn').addEventListener('click', openAddTaskModal);
  document.getElementById('closeAddTaskModal').addEventListener('click', () => closeModal('addTaskModal'));
  document.getElementById('saveTaskBtn').addEventListener('click', saveTask);

  // Updates
  document.getElementById('postUpdateBtn').addEventListener('click', postUpdate);
  document.getElementById('updateDate').valueAsDate = new Date();
  
  // Enter key support for quick entry
  document.getElementById('updateText').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      postUpdate();
    }
  });

  // Checklists
  const addChecklistItemBtn = document.getElementById('addChecklistItemBtn');
  if (addChecklistItemBtn) addChecklistItemBtn.addEventListener('click', addChecklistItem);
  const newChecklistItem = document.getElementById('newChecklistItem');
  if (newChecklistItem) {
    newChecklistItem.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); addChecklistItem(); }
    });
  }

// Files
  const fileUploadArea = document.getElementById('fileUploadArea');
  const fileInput = document.getElementById('fileInput');
  
  fileUploadArea.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', handleFileUpload);
  
  fileUploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    fileUploadArea.style.borderColor = 'var(--color-primary)';
  });
  
  fileUploadArea.addEventListener('dragleave', () => {
    fileUploadArea.style.borderColor = 'var(--color-border)';
  });
  
  fileUploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    fileUploadArea.style.borderColor = 'var(--color-border)';
    handleFileDrop(e);
  });

  // Template modal
  document.getElementById('closeTemplateModal').addEventListener('click', () => closeModal('templateModal'));
  document.getElementById('saveTemplateBtn').addEventListener('click', saveTemplate);
  document.getElementById('deleteTemplateBtn').addEventListener('click', deleteTemplate);
}

// View switching
function switchView(viewName) {
  appState.currentView = viewName;
  
  // Update nav buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.view === viewName) {
      btn.classList.add('active');
    }
  });

  // Update view containers
  document.querySelectorAll('.view-container').forEach(view => {
    view.classList.remove('active');
  });
  document.getElementById(`${viewName}View`).classList.add('active');

  // Render appropriate content
  if (viewName === 'projects') {
    renderProjects();
  } else if (viewName === 'overview') {
    renderOverview();
  } else if (viewName === 'templates') {
    renderTemplates();
  }
}

// Render projects
function renderProjects() {
  const grid = document.getElementById('projectsGrid');
  
  if (appState.projects.length === 0) {
    grid.innerHTML = '<div class="empty-state">No projects yet. Click "+ Add Project" to get started.</div>';
    return;
  }

  grid.innerHTML = appState.projects.map(project => `
    <div class="project-card">
      <div class="project-card-header">
        <div class="project-info">
          <h3>${project.name}</h3>
          <div class="project-meta">
            <span>👤 ${project.owner}</span>
            <span>📅 ${formatDate(project.startDate)}</span>
            <span>💰 $${Number(project.budget).toLocaleString()}</span>
          </div>
        </div>
        <div class="project-action-group">
  <button class="btn btn--sm btn--outline" onclick="openProjectChart('${project.id}')">Flow chart</button>
  <button class="project-action-btn" title="Chart view" onclick="openProjectChart('${project.id}')">📊</button>
  <button class="project-action-btn" title="Edit project" onclick="openEditProjectModal('${project.id}')">⚙️</button>
</div>
      </div>
      <div class="stage-progression">
        ${project.stages.map((stage, index) => `
          <div class="stage-item" draggable="true"      ondragstart="onStageDragStart(event, '${project.id}', ${index})"      ondragover="onStageDragOver(event)"      ondrop="onStageDrop(event, '${project.id}', ${index})"      ondragend="onStageDragEnd()">
            <div class="stage-circle ${stage.status}" onclick="openStageModal('${project.id}', ${index})">
              ${index + 1}
              <div class="stage-label">${stage.name}</div>
            </div>
            ${index < project.stages.length - 1 ? '<div class="stage-connector"></div>' : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

// Render overview
function renderOverview() {
  const stats = calculateGlobalStats();
  
  document.getElementById('overviewStats').innerHTML = `
    <div class="stat-card">
      <h3>Total Projects</h3>
      <div class="stat-value">${stats.totalProjects}</div>
    </div>
    <div class="stat-card">
      <h3>Completed Stages</h3>
      <div class="stat-value">${stats.completedStages}</div>
    </div>
    <div class="stat-card">
      <h3>Pending Tasks</h3>
      <div class="stat-value">${stats.pendingTasks}</div>
    </div>
    <div class="stat-card">
      <h3>Completed Tasks</h3>
      <div class="stat-value">${stats.completedTasks}</div>
    </div>
  `;

  // Recent updates
  const recentUpdates = getAllUpdates().slice(0, 10);
  document.getElementById('recentUpdatesList').innerHTML = recentUpdates.length > 0 
    ? recentUpdates.map(update => `
        <div class="update-item">
          <div class="update-header">
            <div>
              <strong>${update.projectName}</strong> - ${update.stageName}
            </div>
            <div class="update-date">${formatDate(update.timestamp)}</div>
          </div>
          <p>${update.text}</p>
        </div>
      `).join('')
    : '<div class="empty-state">No updates yet</div>';

  // Quick links
  document.getElementById('quickLinksList').innerHTML = appState.projects.length > 0
    ? appState.projects.map(project => `
        <div class="quick-link-item" onclick="switchView('projects')">
          <strong>${project.name}</strong>
          <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary); margin-top: var(--space-4);">
            ${project.stages.filter(s => s.status === 'completed').length}/${project.stages.length} stages completed
          </div>
        </div>
      `).join('')
    : '<div class="empty-state">No projects yet</div>';
}

// Render templates
function renderTemplates() {
  const list = document.getElementById('templatesList');
  
  if (appState.templates.length === 0) {
    list.innerHTML = '<div class="empty-state">No templates yet. Click "+ Add Template" to create one.</div>';
    return;
  }

  list.innerHTML = appState.templates.map(template => `
    <div class="template-card">
      <div class="template-info">
        <h3>${template.name}</h3>
        <div class="template-stages">${template.stages.join(' → ')}</div>
      </div>
      <div class="template-actions">
        <button class="btn btn--outline" onclick="openEditTemplateModal('${template.id}')">Edit</button>
        <button class="btn btn--primary" onclick="createProjectFromTemplate('${template.id}')">Use Template</button>
      </div>
    </div>
  `).join('');
}

// Calculate global statistics
function calculateGlobalStats() {
  let completedStages = 0;
  let pendingTasks = 0;
  let completedTasks = 0;

  appState.projects.forEach(project => {
    project.stages.forEach(stage => {
      if (stage.status === 'completed') completedStages++;
      stage.tasks.forEach(task => {
        if (task.completed) {
          completedTasks++;
        } else {
          pendingTasks++;
        }
      });
    });
  });

  return {
    totalProjects: appState.projects.length,
    completedStages,
    pendingTasks,
    completedTasks
  };
}

// Get all updates across all projects
function getAllUpdates() {
  const updates = [];
  
  appState.projects.forEach(project => {
    project.stages.forEach(stage => {
      stage.updates.forEach(update => {
        updates.push({
          ...update,
          projectName: project.name,
          stageName: stage.name
        });
      });
    });
  });

  return updates.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

// Open stage modal
function openStageModal(projectId, stageIndex) {
  const project = appState.projects.find(p => p.id === projectId);
  const stage = project.stages[stageIndex];
  if (!stage.checklists) stage.checklists = [];
  
  appState.currentProject = projectId;
  appState.currentStage = stageIndex;

  document.getElementById('stageModalTitle').textContent = `${project.name} - ${stage.name}`;
  document.getElementById('stageStatus').value = stage.status;
  
  if (stage.completionDate) {
    document.getElementById('stageCompletionDate').value = stage.completionDate;
  }
  
  handleStageStatusChange();
  renderStageTasks();
  renderStageUpdates();
  renderStageFiles();
  renderStageChecklists();
  
  openModal('stageModal');
}

// Handle stage status change

function handleStageStatusChange() {
  const statusSelect = document.getElementById('stageStatus');
  const newStatus = statusSelect.value;
  const completionDateGroup = document.getElementById('completionDateGroup');

  const project = appState.projects.find(p => p.id === appState.currentProject);
  const stage = project.stages[appState.currentStage];

  if (newStatus === 'completed') {
    const tasks = stage.tasks || [];
    const hasIncomplete = tasks.some(t => !t.completed);
    const checklistItems = stage.checklists || [];
    const hasChecklistIncomplete = checklistItems.some(i => !i.completed);
    if (hasIncomplete || hasChecklistIncomplete) {
      alert('You cannot complete this stage until all tasks and checklist items are completed.');
      statusSelect.value = stage.status || 'in-progress';
      return;
    }
  }

  if (newStatus === 'completed') {
    completionDateGroup.style.display = 'block';
    if (!document.getElementById('stageCompletionDate').value) {
      document.getElementById('stageCompletionDate').valueAsDate = new Date();
    }
  } else {
    completionDateGroup.style.display = 'none';
  }

  stage.status = newStatus;
  markModified();
  renderProjects();
}


// Handle stage completion date change
function handleStageCompletionDateChange() {
  const date = document.getElementById('stageCompletionDate').value;
  const project = appState.projects.find(p => p.id === appState.currentProject);
  const stage = project.stages[appState.currentStage];
  stage.completionDate = date;
  
  markModified();
}

// Render stage tasks

function renderStageTasks() {
  const project = appState.projects.find(p => p.id === appState.currentProject);
  const stage = project.stages[appState.currentStage];
  const tasksList = document.getElementById('tasksList');

  const tasks = stage.tasks || [];
  if (tasks.length === 0) {
    tasksList.innerHTML = '<div class="empty-state">No tasks yet. Click "+ Add Task" to create one.</div>';
    return;
  }

  tasksList.innerHTML = tasks.map(task => `
    <div class="task-card ${task.completed ? 'task-card--completed' : ''}" draggable="true"   ondragstart="onTaskDragStart(event, '${task.id}')"   ondragover="onTaskDragOver(event)"   ondrop="onTaskDrop(event, '${task.id}')"   ondragend="onTaskDragEnd()">
      <div class="task-main">
        <div class="task-title-row">
          <div class="task-title-group">
            <span class="task-name">${task.name}</span>
          </div>
          <div class="task-meta">
            <button class="task-status-pill ${task.completed ? 'task-status-pill--done' : ''}" onclick="toggleTask('${task.id}')">
              ${task.completed ? 'Completed' : 'Not completed'}
            </button>
            ${task.dueDate ? `<span class="task-badge task-badge--date">📅 ${formatDate(task.dueDate)}</span>` : ''}
          </div>
        </div>
        ${task.details ? `<div class="task-details">${task.details}</div>` : ''}
      </div>
      <div class="task-actions">
        <button class="btn btn--icon" onclick="deleteTask('${task.id}')" title="Delete task">🗑️</button>
      </div>
    </div>
  `).join('');


  // Drop zone to move a task to the end of the list
  tasksList.insertAdjacentHTML('beforeend', `
    <div class="task-dropzone" ondragover="onTaskDragOver(event)" ondrop="onTaskDropToEnd(event)" title="Drop here to move to end">
      Drop here to move task to end
    </div>
  `);

  // Keep the Update tab's task dropdown in sync
  const updateTaskSelect = document.getElementById('updateTaskSelect');
  if (updateTaskSelect) {
    updateTaskSelect.innerHTML = '<option value="">No task assigned</option>' +
      tasks.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
  }
}


// Toggle task completion
function toggleTask(taskId) {
  const project = appState.projects.find(p => p.id === appState.currentProject);
  const stage = project.stages[appState.currentStage];
  const task = stage.tasks.find(t => t.id === taskId);
  
  task.completed = !task.completed;
  
  markModified();
  renderStageTasks();
  renderStageUpdates();
}

// Reassign task
function reassignTask(taskId) {
  const project = appState.projects.find(p => p.id === appState.currentProject);
  const stage = project.stages[appState.currentStage];
  const task = stage.tasks.find(t => t.id === taskId);
  
  const newAssignee = prompt('Assign to:', task.assignedTo);
  if (newAssignee !== null) {
    task.assignedTo = newAssignee.trim();
    markModified();
    renderStageTasks();
  }
}

// Open add task modal
function openAddTaskModal() {
  document.getElementById('taskName').value = '';
  document.getElementById('taskAssignedTo').value = '';
  document.getElementById('taskDueDate').value = '';
  openModal('addTaskModal');
}

// Save task
function saveTask() {
  const name = document.getElementById('taskName').value.trim();
  if (!name) return;

  const project = appState.projects.find(p => p.id === appState.currentProject);
  const stage = project.stages[appState.currentStage];
  
  const task = {
    id: 't' + Date.now(),
    name,
    assignedTo: document.getElementById('taskAssignedTo').value.trim(),
    dueDate: document.getElementById('taskDueDate').value,
    completed: false
  };

  stage.tasks.push(task);
  
  markModified();
  renderStageTasks();
  closeModal('addTaskModal');
}

// Delete task
function deleteTask(taskId) {
  if (!confirm('Delete this task and all its updates?')) return;

  const project = appState.projects.find(p => p.id === appState.currentProject);
  const stage = project.stages[appState.currentStage];
  
  stage.tasks = stage.tasks.filter(t => t.id !== taskId);
  stage.updates = stage.updates.filter(u => u.taskId !== taskId);
  
  markModified();
  renderStageTasks();
  renderStageUpdates();
}

// Render stage updates
function renderStageUpdates() {
  const project = appState.projects.find(p => p.id === appState.currentProject);
  const stage = project.stages[appState.currentStage];
  const updatesList = document.getElementById('updatesList');
  
  if (stage.updates.length === 0) {
    updatesList.innerHTML = '<div class="empty-state">No updates yet</div>';
    return;
  }

  // Sort updates by timestamp (newest first)
  const sortedUpdates = [...stage.updates].sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  );

  updatesList.innerHTML = sortedUpdates.map(update => {
    const task = stage.tasks.find(t => t.id === update.taskId);
    const isTaskCompleted = task && task.completed;
    
    return `
      <div class="update-item ${isTaskCompleted ? 'task-completed' : ''}">
        <div class="update-header">
          <div class="update-date">${formatDateTime(update.timestamp)}</div>
          <button class="delete-update-btn" onclick="deleteUpdate('${update.id}')">🗑️</button>
        </div>
        <p>${update.text}</p>
        ${task ? `<div class="update-task-badge">${task.name}</div>` : ''}
      </div>
    `;
  }).join('');
}

// Post update
function postUpdate() {
  const text = document.getElementById('updateText').value.trim();
  if (!text) return;

  const project = appState.projects.find(p => p.id === appState.currentProject);
  const stage = project.stages[appState.currentStage];
  
  const dateValue = document.getElementById('updateDate').value;
  const timestamp = dateValue ? new Date(dateValue).toISOString() : new Date().toISOString();
  
  const update = {
    id: 'u' + Date.now(),
    text,
    timestamp,
    taskId: document.getElementById('updateTaskSelect').value || null
  };

  stage.updates.push(update);
  
  document.getElementById('updateText').value = '';
  document.getElementById('updateDate').valueAsDate = new Date();
  document.getElementById('updateTaskSelect').value = '';
  
  markModified();
  renderStageUpdates();
  renderStageTasks(); // Refresh tasks to show new updates
}

// Delete update
function deleteUpdate(updateId) {
  if (!confirm('Delete this update?')) return;
  
  const project = appState.projects.find(p => p.id === appState.currentProject);
  const stage = project.stages[appState.currentStage];
  
  stage.updates = stage.updates.filter(u => u.id !== updateId);
  
  markModified();
  renderStageUpdates();
  renderStageTasks(); // Refresh tasks to update nested updates
}

// Render stage files
function renderStageFiles() {
  const project = appState.projects.find(p => p.id === appState.currentProject);
  const stage = project.stages[appState.currentStage];
  const filesList = document.getElementById('filesList');
  
  if (!stage.files || stage.files.length === 0) {
    filesList.innerHTML = '<div class="empty-state">No files uploaded yet</div>';
    return;
  }

  filesList.innerHTML = stage.files.map(file => `
    <div class="file-item">
      <div class="file-info">
        <div class="file-name">📄 ${file.name}</div>
        <div class="file-path">${file.path}</div>
      </div>
      <button class="delete-file-btn" onclick="deleteFile('${file.id}')">🗑️</button>
    </div>
  `).join('');
}

// Handle file upload
function handleFileUpload(e) {
  const files = Array.from(e.target.files);
  addFiles(files);
}

// Handle file drop
function handleFileDrop(e) {
  const files = Array.from(e.dataTransfer.files);
  addFiles(files);
}

// Add files
function addFiles(files) {
  const project = appState.projects.find(p => p.id === appState.currentProject);
  const stageIndex = appState.currentStage;
  const stage = project.stages[stageIndex];

  if (!stage.files) stage.files = [];

  const safeProjectName = project.name.replace(/\s+/g, '_');
  const safeStageName = stage.name.replace(/\s+/g, '_');
  const folderName = `${project.id}_${safeProjectName}_stage_${stageIndex + 1}_${safeStageName}`;

  // Decide attachment mode
  let mode = 'copy';
  if (confirm('Attach file as a stored copy? Click "Cancel" to attach as a link instead.')) {
    mode = 'copy';
  } else {
    mode = 'link';
  }

  files.forEach(file => {
    const fileObj = {
      id: 'f' + Date.now() + Math.random(),
      name: file.name,
      uploadDate: new Date().toISOString(),
      size: file.size || 0
    };

    if (mode === 'link') {
      // Link only: ask for a path or URL
      const existingPath = (file.path || '');
      const link = prompt('Enter file path or URL to link to:', existingPath);
      if (!link) return;
      fileObj.path = link;
    } else if (isElectron && window.electronAPI && window.electronAPI.saveFile) {
      // Copy file into data folder via Electron main process
      const reader = new FileReader();
      reader.onload = function(evt) {
        const base64Data = evt.target.result.split(',')[1]; // remove data: prefix
        window.electronAPI.saveFile({
          folderName,
          fileName: file.name,
          dataBase64: base64Data
        }).then(result => {
          if (result && result.success && result.path) {
            fileObj.path = result.path;
            stage.files.push(fileObj);
            markModified();
            renderStageFiles();
          } else {
            alert('Failed to save file: ' + (result && result.error ? result.error : 'Unknown error'));
          }
        });
      };
      reader.readAsDataURL(file);
      return; // we'll push after save
    } else {
      // Browser-only fallback: relative path
      fileObj.path = `${folderName}/${file.name}`;
    }

    stage.files.push(fileObj);
  });

  if (!isElectron) {
    markModified();
    renderStageFiles();
  }
}

// Delete file


function deleteFile(fileId) {
  if (!confirm('Delete this file?')) return;
  
  const project = appState.projects.find(p => p.id === appState.currentProject);
  const stage = project.stages[appState.currentStage];
  
  stage.files = stage.files.filter(f => f.id !== fileId);
  
  markModified();
  renderStageFiles();
}

// Switch modal tab
function switchModalTab(tabName) {
  document.querySelectorAll('.modal-tab-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.tab === tabName) {
      btn.classList.add('active');
    }
  });

  document.querySelectorAll('.modal-tab-content').forEach(content => {
    content.classList.remove('active');
  });
  document.getElementById(`${tabName}Tab`).classList.add('active');
  // Render on demand
  if (tabName === 'tasks') renderStageTasks();
  if (tabName === 'updates') renderStageUpdates();
  if (tabName === 'files') renderStageFiles();
  if (tabName === 'checklists') renderStageChecklists();
}

// Open add project modal
function openAddProjectModal() {
  appState.pendingProjectImport = null;

  appState.currentProject = null;
  document.getElementById('projectModalTitle').textContent = 'Add Project';
  document.getElementById('projectName').value = '';
  document.getElementById('projectDescription').value = '';
  document.getElementById('projectOwner').value = '';
  document.getElementById('projectBudget').value = '';
  document.getElementById('projectStartDate').valueAsDate = new Date();
  document.getElementById('deleteProjectBtn').style.display = 'none';
  updateProjectImportSummary();
  openModal('projectModal');
}

// Open edit project modal
function openEditProjectModal(projectId) {
  appState.pendingProjectImport = null;

  const project = appState.projects.find(p => p.id === projectId);
  appState.currentProject = projectId;
  
  document.getElementById('projectModalTitle').textContent = 'Edit Project';
  document.getElementById('projectName').value = project.name;
  document.getElementById('projectDescription').value = project.description || '';
  document.getElementById('projectOwner').value = project.owner;
  document.getElementById('projectBudget').value = project.budget;
  document.getElementById('projectStartDate').value = project.startDate;
  document.getElementById('deleteProjectBtn').style.display = 'block';
  updateProjectImportSummary();
  openModal('projectModal');
}

// Save project


function updateProjectImportSummary() {
  const summaryEl = document.getElementById('projectImportSummary');
  const clearBtn = document.getElementById('projectClearImportBtn');
  const previewBtn = document.getElementById('projectPreviewImportBtn');
  const optionsWrap = document.getElementById('projectImportOptions');
  const modeSelect = document.getElementById('projectImportMode');
  if (!summaryEl) return;

  if (!appState.pendingProjectImport) {
    summaryEl.textContent = 'No import selected';
    if (clearBtn) clearBtn.style.display = 'none';
    if (previewBtn) previewBtn.style.display = 'none';
    if (optionsWrap) optionsWrap.style.display = 'none';
    return;
  }

  const s = appState.pendingProjectImport.summary;
  const label = appState.pendingProjectImport.path
    ? (appState.pendingProjectImport.path.split(/[\\/]/).pop())
    : 'CSV';

  const mode = appState.pendingProjectImport.mode || 'replace';
  if (modeSelect) modeSelect.value = mode;

  summaryEl.textContent =
    `Selected: ${label} (${s.stages} stages, ${s.tasks} tasks, ${s.checklists} checklist items) • Mode: ${mode === 'merge' ? 'Merge' : 'Replace'}`;

  if (clearBtn) clearBtn.style.display = 'inline-flex';
  if (previewBtn) previewBtn.style.display = 'inline-flex';
  if (optionsWrap) optionsWrap.style.display = 'block';
}

async function chooseProjectImportCsv() {
  if (!isElectron || !window.electronAPI) {
    alert('Import is only available in the desktop app.');
    return;
  }
  try {
    const picker = window.electronAPI.pickCsvFile ? window.electronAPI.pickCsvFile : null;
    if (!picker) {
      alert('CSV picker is not available in this build.');
      return;
    }
    const result = await picker();
    if (!result || !result.success) {
      alert(result && result.error ? result.error : 'No CSV selected.');
      return;
    }
    const parsed = parseStageTaskChecklistCsv(result.content || '');
    const modeSelect = document.getElementById('projectImportMode');
    const mode = modeSelect ? modeSelect.value : 'replace';

    appState.pendingProjectImport = {
      path: result.path || '',
      stages: parsed.stages,
      summary: parsed.summary,
      mode
    };
    updateProjectImportSummary();
  } catch (e) {
    console.error('Project import select failed', e);
    alert('Could not load CSV: ' + e.message);
  }
}

function clearProjectImportSelection() {
  appState.pendingProjectImport = null;
  updateProjectImportSummary();
}


function saveProject() {
  const name = document.getElementById('projectName').value.trim();
  if (!name) return;

  const projectData = {
    name,
    description: document.getElementById('projectDescription').value.trim(),
    owner: document.getElementById('projectOwner').value.trim(),
    budget: document.getElementById('projectBudget').value,
    startDate: document.getElementById('projectStartDate').value
  };

  const pendingImport = appState.pendingProjectImport ? appState.pendingProjectImport : null;
  const modeSelect = document.getElementById('projectImportMode');
  const importMode = modeSelect ? modeSelect.value : (pendingImport ? (pendingImport.mode || 'replace') : 'replace');
  if (pendingImport) pendingImport.mode = importMode;

  if (appState.currentProject) {
    // Edit existing project
    const project = appState.projects.find(p => p.id === appState.currentProject);
    Object.assign(project, projectData);

    // Allow stage name edits from comma list (rename only, do not restructure)
    const stagesInput = document.getElementById('projectStages');
    if (stagesInput && project.stages) {
      const names = stagesInput.value.split(',').map(s => s.trim()).filter(Boolean);
      if (names.length) {
        project.stages.forEach((st, idx) => { if (idx < names.length) st.name = names[idx]; });
      }
    }

    // Apply pending import (merge/replace) if selected
    if (pendingImport && Array.isArray(pendingImport.stages)) {
      const msg = importMode === 'merge'
        ? 'Import will MERGE tasks/checklists into matching stage names and add any missing stages. Continue?'
        : 'Import will REPLACE ALL stages (and their tasks/checklists) in this project. Continue?';
      const ok = confirm(msg);
      if (ok) {
        if (importMode === 'merge') {
          mergeImportIntoProject(project, pendingImport.stages);
        } else {
          project.stages = cloneImportedStages(pendingImport.stages);
        }
        appState.pendingProjectImport = null;
        updateProjectImportSummary();
      }
    }

    markModified();
    renderProjects();
    closeModal('projectModal');
    return;
  }

  // Add new project
  const stagesInput = document.getElementById('projectStages');
  const templateSelect = document.getElementById('projectTemplate');

  let stageNames = [];
  if (stagesInput && stagesInput.value.trim()) stageNames = stagesInput.value.split(',').map(s => s.trim()).filter(Boolean);
  if (!stageNames.length && templateSelect && templateSelect.value) {
    const template = (appState.templates || []).find(t => t.id === templateSelect.value);
    if (template) stageNames = [...template.stages];
  }
  if (!stageNames.length) stageNames = ['Planning', 'Execution', 'Review'];

  const id = 'p' + Date.now();
  const newProject = {
    id,
    ...projectData,
    stages: stageNames.map(n => ({ name: n, status: 'not-started', completionDate: null, tasks: [], updates: [], files: [], checklists: [] }))
  };

  // Apply pending import into the new project
  if (pendingImport && Array.isArray(pendingImport.stages)) {
    if (importMode === 'merge') {
      mergeImportIntoProject(newProject, pendingImport.stages);
    } else {
      newProject.stages = cloneImportedStages(pendingImport.stages);
    }
    appState.pendingProjectImport = null;
    updateProjectImportSummary();
  }

  appState.projects.push(newProject);
  appState.currentProject = id;

  markModified();
  renderProjects();
  closeModal('projectModal');
}


// Delete project
function deleteProject() {
  if (!confirm('Delete this project and all its data?')) return;

  appState.projects = appState.projects.filter(p => p.id !== appState.currentProject);
  
  markModified();
  renderProjects();
  closeModal('projectModal');
}

// Open add template modal
function openAddTemplateModal() {
  appState.currentTemplate = null;
  document.getElementById('templateName').value = '';
  document.getElementById('templateStages').value = '';
  document.getElementById('deleteTemplateBtn').style.display = 'none';
  openModal('templateModal');
}

// Open edit template modal
function openEditTemplateModal(templateId) {
  const template = appState.templates.find(t => t.id === templateId);
  appState.currentTemplate = templateId;
  
  document.getElementById('templateName').value = template.name;
  document.getElementById('templateStages').value = template.stages.join(', ');
  document.getElementById('deleteTemplateBtn').style.display = 'block';
  openModal('templateModal');
}

// Save template
function saveTemplate() {
  const name = document.getElementById('templateName').value.trim();
  const stagesStr = document.getElementById('templateStages').value.trim();
  
  if (!name || !stagesStr) return;

  const stages = stagesStr.split(',').map(s => s.trim()).filter(s => s);

  if (appState.currentTemplate) {
    // Edit existing
    const template = appState.templates.find(t => t.id === appState.currentTemplate);
    template.name = name;
    template.stages = stages;
  } else {
    // Create new
    const newTemplate = {
      id: 'template-' + Date.now(),
      name,
      stages
    };
    appState.templates.push(newTemplate);
  }

  markModified();
  renderTemplates();
  closeModal('templateModal');
}

// Delete template
function deleteTemplate() {
  if (!confirm('Delete this template?')) return;

  appState.templates = appState.templates.filter(t => t.id !== appState.currentTemplate);
  
  markModified();
  renderTemplates();
  closeModal('templateModal');
}

// Create project from template

function createProjectFromTemplate(templateId) {
  // Instead of using a prompt, open the normal "Add Project" flow with the template pre-selected.
  const template = appState.templates.find(t => t.id === templateId);
  if (!template) return;

  switchView('projects');
  openAddProjectModal();

  const templateSelect = document.getElementById('projectTemplate');
  if (templateSelect) {
    templateSelect.value = templateId;
  }

  const stagesInput = document.getElementById('projectStages');
  if (stagesInput) {
    stagesInput.value = template.stages.join(', ');
  }
}


// Modal helpers
function openModal(modalId) {
  document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
}

// Export to CSV (single combined file)
function exportToCSV() {
  const rows = [];

  function pushSectionHeader(name) {
    rows.push('#' + name.toUpperCase());
  }

  function pushRow(obj) {
    const headers = Object.keys(obj);
    if (rows.length === 0 || rows[rows.length - 1].startsWith('#')) {
      rows.push(headers.join(','));
    }
    rows.push(headers.map(k => {
      const val = obj[k] == null ? '' : String(obj[k]);
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        return '"' + val.replace(/"/g, '""') + '"';
      }
      return val;
    }).join(','));
  }

  // Projects
  pushSectionHeader('projects');
  appState.projects.forEach(project => {
    const totalStages = project.stages.length;
    const completedStages = project.stages.filter(s => s.status === 'completed').length;
    pushRow({
      type: 'project',
      id: project.id,
      name: project.name,
      description: project.description || '',
      owner: project.owner || '',
      budget: project.budget || '',
      startDate: project.startDate || '',
      status: project.status || '',
      totalStages,
      completedStages
    });
  });

  // Stages, tasks, updates, files
  pushSectionHeader('stages');
  appState.projects.forEach(project => {
    project.stages.forEach((stage, stageIndex) => {
      pushRow({
        type: 'stage',
        projectId: project.id,
        projectName: project.name,
        stageIndex,
        name: stage.name,
        status: stage.status,
        completionDate: stage.completionDate || ''
      });
    });
  });

  pushSectionHeader('tasks');
  appState.projects.forEach(project => {
    project.stages.forEach((stage, stageIndex) => {
      stage.tasks.forEach(task => {
        pushRow({
          type: 'task',
          projectId: project.id,
          projectName: project.name,
          stageIndex,
          stageName: stage.name,
          taskId: task.id,
          taskName: task.name,
          completed: task.completed,
          assignedTo: task.assignedTo || '',
          dueDate: task.dueDate || '',
          createdBy: task.createdBy || ''
        });
      });
    });
  });

  pushSectionHeader('updates');
  appState.projects.forEach(project => {
    project.stages.forEach((stage, stageIndex) => {
      (stage.updates || []).forEach(update => {
        pushRow({
          type: 'update',
          projectId: project.id,
          projectName: project.name,
          stageIndex,
          stageName: stage.name,
          updateId: update.id,
          text: update.text,
          timestamp: update.timestamp,
          taskId: update.taskId || ''
        });
      });
    });
  });

  pushSectionHeader('files');
  appState.projects.forEach(project => {
    project.stages.forEach((stage, stageIndex) => {
      (stage.files || []).forEach(file => {
        pushRow({
          type: 'file',
          projectId: project.id,
          projectName: project.name,
          stageIndex,
          stageName: stage.name,
          fileId: file.id,
          fileName: file.name,
          path: file.path,
          uploadDate: file.uploadDate || '',
          size: file.size || 0,
          linkedTask: file.taskId || '',
          linkedUpdate: file.updateId || ''
        });
      });
    });
  });


  pushSectionHeader('checklists');
  appState.projects.forEach(project => {
    project.stages.forEach((stage, stageIndex) => {
      (stage.checklists || []).forEach(item => {
        pushRow({
          type: 'checklist',
          projectId: project.id,
          projectName: project.name,
          stageIndex,
          stageName: stage.name,
          checklistId: item.id,
          text: item.text || '',
          completed: item.completed
        });
      });
    });
  });

  const csvContent = rows.join('\n');

  if (isElectron && window.electronAPI && window.electronAPI.saveCSV) {
    window.electronAPI.saveCSV(csvContent).then(result => {
      if (!result || !result.success) {
        alert('Failed to save CSV: ' + (result && result.error ? result.error : 'Unknown error'));
      } else {
        showSaveIndicator('Data exported', 1500);
      }
    });
  } else {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    link.setAttribute('href', url);
    link.setAttribute('download', `jello_export_${timestamp}.csv`);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}


// Auto-save indicator
let saveIndicator = null;
let autoSaveTimer = null;

function createSaveIndicator() {
  if (!saveIndicator) {
    saveIndicator = document.createElement('div');
    saveIndicator.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 10px 16px;
      background: var(--color-surface);
      border: 1px solid var(--color-card-border);
      border-radius: var(--radius-base);
      box-shadow: var(--shadow-md);
      font-size: var(--font-size-sm);
      z-index: 9999;
      display: none;
      color: var(--color-text);
    `;
    document.body.appendChild(saveIndicator);
  }
  return saveIndicator;
}

function showSaveIndicator(message, duration = 2000) {
  const indicator = createSaveIndicator();
  indicator.textContent = message;
  indicator.style.display = 'block';
  
  setTimeout(() => {
    indicator.style.display = 'none';
  }, duration);
}

function startAutoExport() {
  // Auto-save every 2 seconds after changes
  setInterval(() => {
    if (appState.lastModified && Date.now() - appState.lastModified >= 2000 && Date.now() - appState.lastModified < 4000) {
      showSaveIndicator('Saved ✓');
      appState.lastModified = null; // Reset to avoid repeated saves
    }
  }, 2000);
}

function markModified() {
  appState.lastModified = Date.now();
  showSaveIndicator('Saving...', 1000);
}

// Utility functions
function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateTime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

// Initialize on load
initializeApp();
// Import CSV with basic handling (placeholder for header-mapping UI)
async function handleImportCsv() {
  if (!isElectron || !window.electronAPI || !window.electronAPI.loadCSV) {
    alert('CSV import is only available in the desktop app.');
    return;
  }

  try {
    const result = await window.electronAPI.loadCSV();
    if (!result || !result.success) {
      alert(result && result.error ? result.error : 'No CSV file to import.');
      return;
    }

    const csvContent = result.content;
    // TODO: Implement full header-mapping UI and multi-database support.
    // For now, this is a placeholder where you would parse csvContent
    // and either replace or merge into appState, then:
    // markModified();
    // renderCurrentView();
    alert('CSV loaded from disk. Mapping & merging logic not yet implemented.');
  } catch (e) {
    console.error('Failed to import CSV', e);
    alert('Failed to import CSV: ' + e.message);
  }
}


// ---------------------------------------------------------------------------
// Drag & Drop ordering (Stages + Tasks)
// ---------------------------------------------------------------------------
function reorderArray(arr, fromIndex, toIndex) {
  if (!Array.isArray(arr) || fromIndex === toIndex) return;
  const item = arr.splice(fromIndex, 1)[0];
  arr.splice(toIndex, 0, item);
}

function clearDragOverClasses(selector) {
  document.querySelectorAll(selector).forEach(el => el.classList.remove('drag-over'));
}

// Stage drag state: appState.dragStage = { projectId, fromIndex }
function onStageDragStart(event, projectId, fromIndex) {
  appState.dragStage = { projectId, fromIndex };
  event.dataTransfer.effectAllowed = 'move';
  try { event.dataTransfer.setData('text/plain', `${projectId}:${fromIndex}`); } catch (e) {}
}

function onStageDragOver(event) {
  event.preventDefault();
  const el = event.currentTarget;
  if (el && el.classList) el.classList.add('drag-over');
}

function onStageDrop(event, projectId, toIndex) {
  event.preventDefault();
  const drag = appState.dragStage;
  clearDragOverClasses('.stage-item');

  if (!drag || drag.projectId !== projectId) return;
  const fromIndex = drag.fromIndex;

  const project = appState.projects.find(p => p.id === projectId);
  if (!project || !project.stages) return;

  if (fromIndex === toIndex) return;

  reorderArray(project.stages, fromIndex, toIndex);

  // Keep currentStage pointing to the same stage after reorder (when relevant)
  if (appState.currentProject === projectId && typeof appState.currentStage === 'number') {
    const cur = appState.currentStage;
    if (cur === fromIndex) appState.currentStage = toIndex;
    else if (fromIndex < cur && cur <= toIndex) appState.currentStage = cur - 1;
    else if (toIndex <= cur && cur < fromIndex) appState.currentStage = cur + 1;
  }

  appState.dragStage = null;
  markModified();
  renderProjects();

  // If stage modal is open, refresh its title
  const stageModal = document.getElementById('stageModal');
  if (stageModal && stageModal.classList.contains('active') && appState.currentProject === projectId) {
    const st = project.stages[appState.currentStage];
    document.getElementById('stageModalTitle').textContent = `${project.name} - ${st.name}`;
  }
}

function onStageDragEnd() {
  clearDragOverClasses('.stage-item');
  appState.dragStage = null;
}

// Task drag state: appState.dragTaskId
function onTaskDragStart(event, taskId) {
  appState.dragTaskId = taskId;
  event.dataTransfer.effectAllowed = 'move';
  try { event.dataTransfer.setData('text/plain', taskId); } catch (e) {}
}

function onTaskDragOver(event) {
  event.preventDefault();
  const el = event.currentTarget;
  if (el && el.classList) el.classList.add('drag-over');
}

function onTaskDrop(event, targetTaskId) {
  event.preventDefault();
  clearDragOverClasses('.task-card');
  const draggedId = appState.dragTaskId;
  if (!draggedId || draggedId === targetTaskId) return;

  const project = appState.projects.find(p => p.id === appState.currentProject);
  if (!project) return;
  const stage = project.stages[appState.currentStage];
  if (!stage || !stage.tasks) return;

  const fromIndex = stage.tasks.findIndex(t => t.id === draggedId);
  const toIndex = stage.tasks.findIndex(t => t.id === targetTaskId);
  if (fromIndex < 0 || toIndex < 0) return;

  reorderArray(stage.tasks, fromIndex, toIndex);
  appState.dragTaskId = null;

  markModified();
  renderStageTasks();
  renderStageUpdates();
  renderStageFiles();
  if (typeof renderStageChecklists === 'function') renderStageChecklists();
}

function onTaskDropToEnd(event) {
  event.preventDefault();
  clearDragOverClasses('.task-card');
  const draggedId = appState.dragTaskId;
  if (!draggedId) return;

  const project = appState.projects.find(p => p.id === appState.currentProject);
  if (!project) return;
  const stage = project.stages[appState.currentStage];
  if (!stage || !stage.tasks) return;

  const fromIndex = stage.tasks.findIndex(t => t.id === draggedId);
  if (fromIndex < 0) return;

  reorderArray(stage.tasks, fromIndex, stage.tasks.length - 1);
  appState.dragTaskId = null;

  markModified();
  renderStageTasks();
  renderStageUpdates();
  renderStageFiles();
  if (typeof renderStageChecklists === 'function') renderStageChecklists();
}

function onTaskDragEnd() {
  clearDragOverClasses('.task-card');
  appState.dragTaskId = null;
}


// ---------------------------------------------------------------------------
// Import: Preview + Merge/Replace (Stages/Tasks/Checklists)
// ---------------------------------------------------------------------------
function getStageNamesFromProjectModal() {
  const stagesInput = document.getElementById('projectStages');
  const templateSelect = document.getElementById('projectTemplate');

  let stageNames = [];
  if (stagesInput && stagesInput.value.trim()) {
    stageNames = stagesInput.value.split(',').map(s => s.trim()).filter(Boolean);
  }

  if (!stageNames.length && templateSelect && templateSelect.value) {
    const template = (appState.templates || []).find(t => t.id === templateSelect.value);
    if (template && Array.isArray(template.stages)) stageNames = [...template.stages];
  }

  return stageNames;
}

function cloneImportedStages(importedStages) {
  const now = Date.now();
  return (importedStages || []).map((st, idx) => ({
    name: st.name || `Stage ${idx + 1}`,
    status: st.status || 'not-started',
    completionDate: st.completionDate || null,
    tasks: (st.tasks || []).map(t => ({
      id: 't' + now + Math.random(),
      name: t.name || '',
      completed: !!t.completed,
      assignedTo: t.assignedTo || '',
      dueDate: t.dueDate || '',
      details: t.details || ''
    })),
    updates: [],   // imports do not include updates in this workflow
    files: [],
    checklists: (st.checklists || []).map(c => ({
      id: 'c' + now + Math.random(),
      text: c.text || c.name || '',
      completed: !!c.completed
    }))
  }));
}

function computeImportPreview(baselineStageNames, existingStages, importedStages, mode) {
  const existingMap = new Map();
  (existingStages || []).forEach(s => existingMap.set((s.name || '').trim().toLowerCase(), s));

  const baselineSet = new Set((baselineStageNames || []).map(s => s.trim().toLowerCase()).filter(Boolean));
  const imported = importedStages || [];

  const cards = imported.map(st => {
    const key = (st.name || '').trim().toLowerCase();
    const exists = existingMap.has(key) || baselineSet.has(key);
    return {
      name: st.name || 'Stage',
      exists,
      tasks: (st.tasks || []).length,
      checklists: (st.checklists || []).length
    };
  });

  const newStages = cards.filter(c => !c.exists).length;
  const existingStagesTouched = cards.filter(c => c.exists).length;

  const totals = {
    stages: imported.length,
    tasks: imported.reduce((a, s) => a + (s.tasks || []).length, 0),
    checklists: imported.reduce((a, s) => a + (s.checklists || []).length, 0)
  };

  return {
    mode,
    totals,
    newStages,
    existingStagesTouched,
    cards
  };
}

function mergeImportIntoProject(project, importedStages) {
  const imported = cloneImportedStages(importedStages);
  const map = new Map();
  project.stages.forEach(s => map.set((s.name || '').trim().toLowerCase(), s));

  for (const st of imported) {
    const key = (st.name || '').trim().toLowerCase();
    const existing = map.get(key);

    if (existing) {
      existing.tasks = existing.tasks || [];
      existing.checklists = existing.checklists || [];

      // Append tasks/checklists (lightweight merge). Future enhancement: dedupe.
      existing.tasks.push(...(st.tasks || []));
      existing.checklists.push(...(st.checklists || []));
    } else {
      project.stages.push(st);
      map.set(key, st);
    }
  }
}

function openImportPreviewModal() {
  if (!appState.pendingProjectImport) return;

  const modal = document.getElementById('importPreviewModal');
  const summaryEl = document.getElementById('importPreviewSummary');
  const gridEl = document.getElementById('importPreviewGrid');
  const modeSelect = document.getElementById('projectImportMode');
  const mode = modeSelect ? modeSelect.value : (appState.pendingProjectImport.mode || 'replace');

  appState.pendingProjectImport.mode = mode;

  // Determine baseline
  const project = appState.projects.find(p => p.id === appState.currentProject);
  const isEditing = !!project && document.getElementById('projectModalTitle') &&
    document.getElementById('projectModalTitle').textContent.toLowerCase().includes('edit');

  const baselineStageNames = isEditing ? [] : getStageNamesFromProjectModal();
  const existingStages = isEditing ? (project.stages || []) : (baselineStageNames || []).map(n => ({ name: n }));

  const preview = computeImportPreview(
    baselineStageNames,
    existingStages,
    appState.pendingProjectImport.stages,
    mode
  );

  const label = appState.pendingProjectImport.path
    ? (appState.pendingProjectImport.path.split(/[\\/]/).pop())
    : 'CSV';

  const baselineCount = isEditing ? (existingStages || []).length : (baselineStageNames || []).length;

  summaryEl.textContent =
    `File: ${label} • Mode: ${mode === 'merge' ? 'Merge' : 'Replace'} • Import: ${preview.totals.stages} stages, ${preview.totals.tasks} tasks, ${preview.totals.checklists} checklist items • Baseline stages: ${baselineCount} • New stages: ${preview.newStages} • Existing stages affected: ${preview.existingStagesTouched}`;

  gridEl.innerHTML = preview.cards.map(c => `
    <div class="import-preview-card">
      <h4>${c.name}</h4>
      <div class="import-preview-badges">
        <span class="import-badge ${mode === 'replace' ? 'import-badge--replace' : (c.exists ? 'import-badge--merge' : 'import-badge--new')}">
          ${mode === 'replace' ? 'Will replace' : (c.exists ? 'Will merge' : 'New stage')}
        </span>
        <span class="import-badge">Tasks: ${c.tasks}</span>
        <span class="import-badge">Checklist: ${c.checklists}</span>
      </div>
    </div>
  `).join('');

  openModal('importPreviewModal');
}

function closeImportPreviewModal() {
  closeModal('importPreviewModal');
}

// Ensure UI wiring runs even if script ordering changes
(function () {
  function boot() {
    try {
      if (typeof initializeApp === 'function') initializeApp();
      if (typeof setupEventListeners === 'function') setupEventListeners();
      if (typeof initializeElectronPaths === 'function') initializeElectronPaths();
      // Default view and initial renders
      if (typeof switchView === 'function') switchView('projects');
    } catch (e) {
      console.error('Boot error:', e);
      alert('JELLO failed to start. Open View → Toggle Developer Tools → Console and copy the first error.');
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();


function parseCsvLine(line) {
  const out = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQ) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') { cur += '"'; i++; }
        else inQ = false;
      } else cur += ch;
    } else {
      if (ch === ',') { out.push(cur); cur = ''; }
      else if (ch === '"') inQ = true;
      else cur += ch;
    }
  }
  out.push(cur);
  return out;
}

function parseStageTaskChecklistCsv(csvContent) {
  const lines = (csvContent || '').split(/\r?\n/);
  const stageMap = new Map();
  const stages = [];

  function getOrCreateStage(name) {
    const key = (name || 'Stage').trim() || 'Stage';
    if (stageMap.has(key)) return stageMap.get(key);
    const st = { name: key, status: 'not-started', completionDate: null, tasks: [], updates: [], files: [], checklists: [] };
    stageMap.set(key, st);
    stages.push(st);
    return st;
  }

  // Detect sectioned format
  const hasSection = lines.some(l => l.trim().startsWith('#'));
  if (hasSection) {
    let section = null;
    let headers = null;

    for (const raw of lines) {
      const line = raw.trim();
      if (!line) continue;
      if (line.startsWith('#')) {
        section = line.replace('#','').trim().toLowerCase();
        headers = null;
        continue;
      }
      if (!section) continue;
      if (!headers) { headers = parseCsvLine(line).map(h => h.trim()); continue; }
      const cols = parseCsvLine(line);
      const row = {};
      headers.forEach((h, i) => row[h] = cols[i] || '');

      if (section === 'stages') {
        const st = getOrCreateStage(row.stageName || row.stage || row.name);
        if (row.status) st.status = row.status;
      } else if (section === 'tasks') {
        const st = getOrCreateStage(row.stageName || row.stage);
        st.tasks.push({
          id: row.taskId || ('t' + Date.now() + Math.random()),
          name: row.taskName || row.task || '',
          completed: String(row.completed).toLowerCase() === 'true',
          assignedTo: row.assignedTo || '',
          dueDate: row.dueDate || '',
          details: row.details || ''
        });
      } else if (section === 'checklists') {
        const st = getOrCreateStage(row.stageName || row.stage);
        st.checklists.push({
          id: row.checklistId || ('c' + Date.now() + Math.random()),
          text: row.item || row.text || '',
          completed: String(row.completed).toLowerCase() === 'true'
        });
      }
    }
  } else {
    // Flat format with columns: stage, type, task/checklist, completed, etc.
    const headerLine = lines.find(l => l.trim().length > 0);
    if (!headerLine) return { stages: [] };
    const headers = parseCsvLine(headerLine).map(h => h.trim().toLowerCase());
    const start = lines.indexOf(headerLine) + 1;

    for (const raw of lines.slice(start)) {
      const line = raw.trim();
      if (!line) continue;
      const cols = parseCsvLine(line);
      const row = {};
      headers.forEach((h, i) => row[h] = cols[i] || '');
      const st = getOrCreateStage(row.stage || row.stagename || row.name);

      const type = (row.type || row.recordtype || '').toLowerCase();
      const completed = String(row.completed).toLowerCase() === 'true';

      if (type === 'task' || row.task) {
        const name = row.task || row.taskname || '';
        if (name) st.tasks.push({
          id: 't' + Date.now() + Math.random(),
          name,
          completed,
          assignedTo: row.assignedto || '',
          dueDate: row.duedate || '',
          details: row.details || ''
        });
      } else if (type === 'checklist' || row.checklist || row.item) {
        const text = row.checklist || row.item || row.text || '';
        if (text) st.checklists.push({
          id: 'c' + Date.now() + Math.random(),
          text,
          completed
        });
      } else {
        // If type omitted but checklist column present
        if (row.item || row.checklist) {
          const text = row.item || row.checklist;
          st.checklists.push({ id: 'c' + Date.now() + Math.random(), text, completed });
        }
      }
    }
  }

  // Ensure at least one stage
  if (stages.length === 0) stages.push({ name: 'Imported', status: 'not-started', completionDate: null, tasks: [], updates: [], files: [], checklists: [] });

  const summary = {
    stages: stages.length,
    tasks: stages.reduce((a,s) => a + (s.tasks||[]).length, 0),
    checklists: stages.reduce((a,s) => a + (s.checklists||[]).length, 0)
  };

  return { stages, summary };
}




function renderStageChecklists() {
  const project = appState.projects.find(p => p.id === appState.currentProject);
  if (!project) return;
  const stage = project.stages[appState.currentStage];
  const list = document.getElementById('checklistsList');
  if (!list) return;

  const items = stage.checklists || [];
  if (items.length === 0) {
    list.innerHTML = '<div class="empty-state">No checklist items yet</div>';
    return;
  }

  list.innerHTML = items.map(item => `
    <div class="checklist-item ${item.completed ? 'checklist-item--done' : ''}">
      <div class="checklist-left">
        <button class="task-status-pill ${item.completed ? 'task-status-pill--done' : ''}" onclick="toggleChecklistItem('${item.id}')">
          ${item.completed ? 'Completed' : 'Not completed'}
        </button>
        <span class="checklist-text">${item.text}</span>
      </div>
      <div class="checklist-actions">
        <button class="btn btn--icon" onclick="deleteChecklistItem('${item.id}')" title="Delete item">🗑️</button>
      </div>
    </div>
  `).join('');
}

function addChecklistItem() {
  const input = document.getElementById('newChecklistItem');
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;

  const project = appState.projects.find(p => p.id === appState.currentProject);
  if (!project) return;
  const stage = project.stages[appState.currentStage];
  if (!stage.checklists) stage.checklists = [];

  stage.checklists.push({ id: 'c' + Date.now(), text, completed: false });
  input.value = '';
  markModified();
  renderStageChecklists();
}

function toggleChecklistItem(itemId) {
  const project = appState.projects.find(p => p.id === appState.currentProject);
  if (!project) return;
  const stage = project.stages[appState.currentStage];
  const item = (stage.checklists || []).find(c => c.id === itemId);
  if (!item) return;
  item.completed = !item.completed;
  markModified();
  renderStageChecklists();
}

function deleteChecklistItem(itemId) {
  const project = appState.projects.find(p => p.id === appState.currentProject);
  if (!project) return;
  const stage = project.stages[appState.currentStage];
  stage.checklists = (stage.checklists || []).filter(c => c.id !== itemId);
  markModified();
  renderStageChecklists();
}


async function importStageTaskChecklistCsv() {
  if (!isElectron || !window.electronAPI) {
    alert('Import is only available in the desktop app.');
    return;
  }
  try {
    const picker = window.electronAPI.pickCsvFile ? window.electronAPI.pickCsvFile : window.electronAPI.loadCSV;
    const result = await picker();
    if (!result || !result.success) {
      alert(result && result.error ? result.error : 'No CSV selected.');
      return;
    }
    applyStageTaskChecklistImport(result.content || '');
  } catch (e) {
    console.error('Import failed', e);
    alert('Import failed: ' + e.message);
  }
}



function applyStageTaskChecklistImport(csvContent) {
  const parsed = parseStageTaskChecklistCsv(csvContent);
  const stages = parsed.stages;

  let project = appState.projects.find(p => p.id === appState.currentProject);

  if (!project) {
    // If no current project, create one
    project = {
      id: 'p' + Date.now(),
      name: 'Imported Project',
      description: 'Imported from CSV',
      owner: '',
      budget: '',
      startDate: new Date().toISOString().slice(0,10),
      stages: []
    };
    appState.projects.push(project);
    appState.currentProject = project.id;
    appState.currentStage = 0;
  }

  const ok = confirm('Import will replace all stages (and their tasks/checklists) in the current project. Continue?');
  if (!ok) return;

  project.stages = stages;
  markModified();
  renderProjects();
  openStageModal(project.id, 0);
}




function openProjectChart(projectId) {
  appState.currentProject = projectId;
  renderProjectChart(projectId);
  openModal('chartModal');
}


function renderProjectChart(projectId) {
  const project = appState.projects.find(p => p.id === projectId);
  if (!project) return;

  const titleEl = document.getElementById('chartModalTitle');
  const container = document.getElementById('chartContainer');
  if (titleEl) titleEl.textContent = project.name + ' — Chart';
  if (!container) return;

  const stageToBadge = (status) => {
    if (status === 'completed') return 'Completed';
    if (status === 'in-progress') return 'In progress';
    return 'Not started';
  };

  container.innerHTML = `
    <div class="chart-grid">
      ${project.stages.map((stage, stageIndex) => {
        const tasks = stage.tasks || [];
        const checklists = stage.checklists || [];
        const updates = stage.updates || [];

        const tasksDone = tasks.filter(t => t.completed).length;
        const checklistDone = checklists.filter(c => c.completed).length;
        const updatesSorted = [...updates].sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));

        return `
          <div class="chart-stage">
            <div class="chart-stage-header" onclick="openStageModal('${projectId}', ${stageIndex})">
              <div>
                <div class="chart-stage-title">${stageIndex + 1}. ${stage.name}</div>
                <div class="chart-stage-sub">${tasksDone}/${tasks.length} tasks • ${checklistDone}/${checklists.length} checklist • ${updates.length} updates</div>
              </div>
              <div class="chart-badge">${stageToBadge(stage.status)}</div>
            </div>

            <div class="chart-section">
              <div class="chart-section-title">Tasks</div>
              ${tasks.length ? tasks.map(task => `
                <div class="chart-item">
                  <button class="task-status-pill ${task.completed ? 'task-status-pill--done' : ''}"
                          onclick="event.stopPropagation(); toggleTaskForChart('${projectId}', ${stageIndex}, '${task.id}')">
                    ${task.completed ? 'Completed' : 'Not completed'}
                  </button>
                  <div class="chart-item-text ${task.completed ? 'chart-item-text--done' : ''}">${task.name}</div>
                  ${task.dueDate ? `<div class="chart-item-meta">📅 ${formatDate(task.dueDate)}</div>` : ''}
                </div>
              `).join('') : '<div class="hint-text">No tasks</div>'}
            </div>

            <div class="chart-section">
              <div class="chart-section-title">Checklist</div>
              ${checklists.length ? checklists.map(item => `
                <div class="chart-item">
                  <button class="task-status-pill ${item.completed ? 'task-status-pill--done' : ''}"
                          onclick="event.stopPropagation(); toggleChecklistForChart('${projectId}', ${stageIndex}, '${item.id}')">
                    ${item.completed ? 'Completed' : 'Not completed'}
                  </button>
                  <div class="chart-item-text ${item.completed ? 'chart-item-text--done' : ''}">${item.text}</div>
                </div>
              `).join('') : '<div class="hint-text">No checklist items</div>'}
            </div>

            <div class="chart-section">
              <div class="chart-section-title">Updates</div>
              ${updatesSorted.length ? updatesSorted.map(u => {
                const snippet = (u.text || '').length > 140 ? ((u.text || '').slice(0, 140) + '…') : (u.text || '');
                const linkedTask = (tasks || []).find(t => t.id === u.taskId);
                return `
                  <div class="chart-item chart-item--update">
                    <div class="chart-update-time">${formatDateTime(u.timestamp)}</div>
                    <div class="chart-update-text">${snippet}</div>
                    ${linkedTask ? `<div class="chart-update-tag">↳ ${linkedTask.name}</div>` : ''}
                  </div>
                `;
              }).join('') : '<div class="hint-text">No updates</div>'}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}


function toggleTaskForChart(projectId, stageIndex, taskId) {
  appState.currentProject = projectId;
  appState.currentStage = stageIndex;
  toggleTask(taskId);
  renderProjectChart(projectId);
  renderProjects();
}

function toggleChecklistForChart(projectId, stageIndex, itemId) {
  appState.currentProject = projectId;
  appState.currentStage = stageIndex;
  toggleChecklistItem(itemId);
  renderProjectChart(projectId);
  renderProjects();
}
