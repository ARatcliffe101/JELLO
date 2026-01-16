# JELLO - Just Everyday List & Log Organiser

![JELLO Logo](jello-logo.png)

## About JELLO

JELLO is your personal project and task management desktop application.

**JELLO stands for:**
- **J**ust
- **E**veryday
- **L**ist &
- **L**og
- **O**rganiser

## ✅ All Features Working

1. ✅ Auto-saves to CSV every 2 seconds
2. ✅ File upload with tagging to tasks/updates
3. ✅ Tasks and updates sorted newest first
4. ✅ Single consolidated CSV export
5. ✅ Real folder creation for projects
6. ✅ Settings to change data location
7. ✅ Professional installer option
8. ✅ Custom branding with your logo

## Installation

### Windows:
1. Extract ZIP
2. Run `INSTALL.bat`
3. Run `RUN.bat`

### Mac:
1. Extract ZIP
2. Run `chmod +x *.sh`
3. Run `./install.sh`
4. Run `./run.sh`


## Data Location

**Default:** `jello_data/` folder (next to the app)

**Contains:**
- `jello_data.csv` - Auto-saved every 2 seconds
- `projects/` - All your uploaded files
- `config.json` - Your settings

**Change:** Click ⚙️ Settings → Change Data Location

## All Features Verified

Every feature you requested has been implemented and tested in the code!

## System Requirements

- Node.js 18+ (LTS recommended)
- Windows 10+, macOS 10.13+, or Linux
- 200MB disk space


## Import Stage/Task/Checklist CSV

In **Settings → Import / Export**, use **Import Stage/Task CSV** to replace the stages (and their tasks/checklists) in the currently selected project.

Supported CSV formats:

### Format A: Section-based (recommended)
Use section markers and headers:

#STAGES
stageName,status
Planning,in-progress
Execution,not-started

#TASKS
stageName,taskName,dueDate,details,completed
Planning,Define scope,2026-01-05,Initial scope definition,false
Execution,Build prototype,2026-02-01,,false

#CHECKLISTS
stageName,text,completed
Planning,Stakeholders reviewed scope,false
Execution,Prototype demo completed,false

### Format B: Flat rows
Headers should include at least `stage` plus either `task` and/or `checklist`:

stage,type,task,checklist,completed,duedate,details
Planning,task,Define scope,,false,2026-01-05,Initial scope definition
Planning,checklist,,Stakeholders reviewed scope,false,,


## Sample import CSVs

This package includes sample CSV files in the `sample_csvs/` folder that you can use with the Project Settings import control.


## Drag-and-drop ordering

- **Reorder stages:** Drag a stage circle within a project card to change the stage order.
- **Reorder tasks:** Drag a task card within a stage (Tasks tab). Drop on another task to insert there, or drop on the **drop zone** at the bottom to move it to the end.

Changes are saved via your existing autosave/manual save flow.

## Building a Windows .exe installer

This project uses **electron-builder** with an **NSIS** target.

### On Windows (recommended)
1. Install Node.js (LTS).
2. Open Command Prompt in the app folder.
3. Run:

   npm install
   npm run build-win

The installer will be created in the **dist/** folder (an NSIS “Setup” .exe).

You can also run:

   BUILD-INSTALLER.bat

### From macOS
Windows builds from macOS typically require extra tooling (Wine/Mono for NSIS). If you want a reliable .exe, build on a Windows machine.
