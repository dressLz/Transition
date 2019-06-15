// pages/components/mytree/mytree.js
Component({
  properties: {
    model: Object,
    menulistIndex:Number
  },

  data: {
    open: false,
    isBranch: false,
  },

  methods: {
    toggle: function (e) {
      if (this.data.isBranch) {
        this.setData({
          open: !this.data.open,
        })
      }
    },
    tapItem: function (e) {
      var itemid = e.currentTarget.dataset.itemid;
      var seq = e.currentTarget.dataset.seq;
      this.triggerEvent('tapitem', { itemid: itemid, seq: seq }, { bubbles: true, composed: true });
    }
  },
  ready: function (e) {
    this.setData({
      isBranch: Boolean(this.data.model.childMenus && this.data.model.childMenus.length),
    });
  },
})