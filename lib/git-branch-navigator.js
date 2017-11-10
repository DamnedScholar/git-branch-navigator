'use babel';

import { CompositeDisposable } from 'atom';
import SelectListView from 'atom-select-list'
const etch = require('etch')
import branch from 'git-branch-to-json'

export default {
  gitBranchNavigatorView: null,
  modalPanel: null,
  subscriptions: null,

  activate() {

    atom.commands.add('atom-workspace', {
      'git-branch-navigator:toggle': () => this.toggle()
    })

    options = {
      //items: [{name: "dev/sample-branch", shortName: "sample-branch", commit: "0987654321", message: "This will be a git branch."}],
      items: [],
      loadingMessage: "Please wait. Fetching branches.",
      filterKeyForItem: (item) => { return item.name },
      elementForItem: (item) => {
        const li = document.createElement('li')
        li.classList.add('git-branch')

        li.innerHTML = `<div class="icon icon-git-branch"><span class="branch-name">` + item.name + ` - ` + item.shortName + `</span><br /><span class="commit-msg">` + item.message + `</span></div><div class="pull-right">` + item.commit + `</div>`
        return li
      },
      didConfirmSelection: (item) => {
        console.log('confirmed', item)
      },
      didConfirmEmptySelection: () => {
        this.cancel()
      },
      didCancelSelection: () => {
        this.cancel()
      }
    }

    this.modalPanel = atom.workspace.addModalPanel({
      item: new SelectListView(options),
      visible: false,
      autoFocus: true
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.gitBranchNavigatorView.destroy();
  },

  // TODO: The panel only cancels when I manually focus on it. Why is that? Maybe I can figure out how to make it autofocus, and `autoFocus` isn't the way. Maybe `autoFocus` fails on panels that don't get respawned every time. Maybe I should respawn it every time.
  cancel() {
    this.modalPanel.hide()
  },

  toggle() {
    branch.branch(atom.project.getPaths()[0]).then( (branches) => {
      this.modalPanel.item.update({
        items: branches
      })
    })
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  }

};
