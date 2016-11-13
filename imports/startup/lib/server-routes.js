import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';
import { DocHead } from 'meteor/kadira:dochead';

import { HEAD_DEFAULTS } from './../../ui/lib/globals.js';


/*
 NOTE: these routes are accessible from the server to enable Fast Render.
 FIXME: add server routes.
*/


FlowRouter.triggers.enter([
    function() {
        DocHead.removeDocHeadAddedTags();
    }
]);

