import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Cloudinary } from 'meteor/lepozepo:cloudinary';

import './photo-tile-templates.html';


Template.photo_tiles.onCreated(function photoTilesOnCreated() {

    // Subscriptions go in here
    this.autorun(() => {
        //...
    });
});
