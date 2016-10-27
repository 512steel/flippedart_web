import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { _ } from 'meteor/underscore';
import { Cloudinary } from 'meteor/lepozepo:cloudinary';
import { DocHead } from 'meteor/kadira:dochead';

import {
    UPLOAD_LIMITS,
    HEAD_DEFAULTS } from '../../lib/globals.js';

import {
    throwError,
    throwSuccess } from '../../lib/temporary-alerts.js';

import { MakeProjects } from '../../../api/make-projects/make-projects.js';
import {
    insert,
    edit,
    approveMakeProject,
    deleteMakeProject,
} from '../../../api/make-projects/methods.js';

import { Comments } from '../../../api/comments/comments.js';
import { UserAttributes } from '../../../api/user-attributes/user-attributes.js';

import './../../components/app-not-authorized.js';

import './make-projects-page.html';
import './make-project-card.html';
import './make-projects-names-list.html';
import './make-project-edit.html';
import './make-project-submit.html';
import './make-projects-thanks-page.html';

import './../photoTiles/photo-tiles-components.js';


//FIXME: could I just import ./../comments/comments-components.js' instead?  And do away with user-autocomplete-components?
import './../comments/comment-card.html';
import './../comments/comment_edit.html';
import './../comments/comment_submit.html';
import './../comments/comments-components.js';
import './../user-profile/user-autocomplete-components.html';


Template.make_projects_page.onCreated(function() {

    //this.getMakeProjectName = () => FlowRouter.getParam('makeProjectName');

    // Subscriptions go in here
    this.autorun(() => {
        //...
    });
});

Template.make_project_card.onCreated(function() {

    this.getMakeProjectName = () => FlowRouter.getParam('makeProjectName');

    // Subscriptions go in here
    this.autorun(() => {
        if (this.getMakeProjectName()) {
            this.subscribe('makeProjects.single.name', this.getMakeProjectName());
        }
        else {
            //NOTE: if there is nothing past '/make' in the URL, pull the most recent makeProject.
            this.subscribe('makeProjects.latest');
        }

        this.getCurrentMakeProject = () => {
            if (this.getMakeProjectName()) {
                return MakeProjects.find(
                    {
                        makeProjectName: this.getMakeProjectName()
                    },
                    {}
                ).fetch()[0];
            }
            else {
                let latestMakeProjectArr = MakeProjects.find({},{sort: {createdAt: -1}, limit: 1}).fetch();

                if (latestMakeProjectArr.length > 0) {
                    return MakeProjects.find(
                        {},
                        {
                            sort: {
                                createdAt: -1
                            },
                            limit: 1
                        }).fetch()[0];  //FIXME: change to findOne();
                }
            }
        }
    });
});

Template.make_project_names_list.onCreated(function() {

    this.getMakeProjectName = () => FlowRouter.getParam('makeProjectName');

    // Subscriptions go in here
    this.autorun(() => {
        this.subscribe('makeProjects.all.names', {sort: {createdAt: -1}});

        this.getProjectsArr = () => MakeProjects.find({},
            {
                sort: {
                    createdAt: -1
                },
                fields: {
                    makeProjectName: 1,
                }
            }).fetch();
    });
});

Template.make_project_edit_page.onCreated(function() {

    this.steps = new ReactiveVar([1]);
    Session.set('isMakeProjectUploading', false);
    let hasPrePopulated = false;  //NOTE: this flag is a hack to force the "steps"
                                  // ReactiveVar to only pre-populate once, but
                                  // *after* we're ready with the makeProject subscription.

    this.getMakeProjectName = () => FlowRouter.getParam('makeProjectName');

    // Subscriptions go in here
    this.autorun(() => {
        if (this.getMakeProjectName()) {
            this.subscribe('makeProjects.single.name', this.getMakeProjectName());
        }

        this.getCurrentMakeProject = () => {
            let makeProjectName = this.getMakeProjectName();
            if (makeProjectName) {
                return MakeProjects.findOne({
                    makeProjectName: makeProjectName,
                });
            }
        };

        //set the "steps" ReactiveVar to the number of steps in the existing makeProject.
        /*
            NOTE: for existing steps, we populate the ReactiveVar itself with
             the {text, imageLinks} object.  This doesn't directly get submitted
             to the edit() method (the actual form data does), but this is useful
             for pre-populating the existing steps' inputs.
        */
        let currentProject = this.getCurrentMakeProject();
        if (currentProject && !hasPrePopulated) {
            let existingSteps = [];
            for (let i=0; i < currentProject.steps.length; i++) {
                existingSteps.push({
                    text: currentProject.steps[i].text,
                    imageLinks: currentProject.steps[i].imageLinks,
                });
            }
            this.steps.set(existingSteps);
            hasPrePopulated = true;
        }
    });
});

Template.make_project_submit_page.onCreated(function() {

    this.steps = new ReactiveVar([1]);
    Session.set('isMakeProjectUploading', false);

    // Subscriptions go in here
    this.autorun(() => {
        //...
    });
});

Template.make_project_submit_thanks_page.onCreated(function() {
    //TODO: DocHead stuff

    this.getWasEdited = () => FlowRouter.getParam('wasEdited');
});


Template.make_projects_page.onRendered(function() {
    //set the sidebar to the correct height, but wait and re-check because Blaze's onRendered method is dumb.
    Meteor.setTimeout(function(){
        resetSidebar();
    }, 50);
    Meteor.setTimeout(function(){
        resetSidebar();
    }, 200);
    Meteor.setTimeout(function(){
        resetSidebar();
    }, 1000);
    Meteor.setInterval(function(){
        resetSidebar();
    }, 1500);
    $(window).resize(_.debounce(() => {
        resetSidebar();
    }, 100));

    let resetSidebar = () => {
        let contentHeight = $('.documentation-page .content').outerHeight();
        let topBarHeight = $('.top-bar').outerHeight();
        $('.documentation-page .left-sidebar').css({
            'height': contentHeight,
            'top': topBarHeight + 48  //TODO: de-magic that "48"
        });
    };

    this.autorun(() => {
        //TODO: this is a hack to force the autorun to reevaluate, but it doesn't seem to be working...
        Template.currentData();

        resetSidebar();
    });
});

Template.make_project_card.onRendered(function() {

});

Template.make_project_names_list.onRendered(function() {

});

Template.make_project_edit_page.onRendered(function() {
    autosize($('textarea'));
});

Template.make_project_submit_page.onRendered(function() {

});


Template.make_projects_page.helpers({

});

Template.make_project_card.helpers({
    currentProjectName: () => {
        let urlName = Template.instance().getMakeProjectName();

        if (urlName) {
            return urlName;
        }
        else {
            let currentMakeProject = Template.instance().getCurrentMakeProject();

            if (currentMakeProject) {
                return currentMakeProject.makeProjectName;
            }
            else return null;
        }
    },
    project: () => {
        return Template.instance().getCurrentMakeProject();
    },
    isProjectOwner: () => {
        let user = Meteor.user();
        if (user) {
            let project = Template.instance().getCurrentMakeProject();
            if (project && user.username == project.author) {
                return true;
            }
        }
        return false;
    },
    isUserAdmin: () => {
        if (!Meteor.user() || !_.contains(Meteor.user().roles, 'admin')) {
            return false
        }
        else {
            return true;
        }
    },
    projectApproved: () => {
        //this is mainly for the admin "approve" button's copy
        let project = Template.instance().getCurrentMakeProject();

        return (project && project.approved) ? true : false;
    },
    ingredientsArray: () => {
        //prettier visual representation of the ingredients list
        let project = Template.instance().getCurrentMakeProject();
        if (project) {
            return project.ingredients.split(',');
        }
    },
});

Template.make_project_names_list.helpers({
    allMakeProjectNames: () => {
        return Template.instance().getProjectsArr().map((el) => {return el.makeProjectName});
    },
    currentMakeProjectName: () => {
        let urlName = Template.instance().getMakeProjectName();
        if (urlName) {
            return urlName;
        }
        else {
            if (Template.instance().getProjectsArr().length > 0) {
                return projectsArr[0].makeProjectName;
            }
        }
    }
});

Template.make_project_edit_page.helpers({
    canEditProject: () => {
        let user = Meteor.user();
        if (user) {
            let project = Template.instance().getCurrentMakeProject();
            if (project && (user.username == project.author || _.contains(user.roles, 'admin'))) {
                // the makeProject's author and admins may edit.
                return true;
            }
        }
        return false;
    },
    project: () => {
        return Template.instance().getCurrentMakeProject();
    },
    steps: () => {
        return Template.instance().steps.get();
    },
    numSteps: () => {
        return Template.instance().steps.get().length;
    },
    isMakeProjectUploading: () => {
        return Session.get('isMakeProjectUploading');
    }
});

Template.make_project_edit_step_input.helpers({
    makeProjectStepImagesLimit: () => {
        return UPLOAD_LIMITS.makeProjectStepImages;
    }
});

Template.make_project_submit_page.helpers({
    steps: () => {
        return Template.instance().steps.get();
    },
    numSteps: () => {
        return Template.instance().steps.get().length;
    },
    isMakeProjectUploading: () => {
        return Session.get('isMakeProjectUploading');
    }
});

Template.make_project_submit_step_input.helpers({
    makeProjectStepImagesLimit: () => {
        return UPLOAD_LIMITS.makeProjectStepImages;
    }
});

Template.make_project_submit_thanks_page.helpers({
    edited: () => {
        return Template.instance().getWasEdited();
    }
});


Template.make_projects_page.events({

});

Template.make_project_card.events({
    'click .js-admin-approve-button': (e) => {
        e.preventDefault();

        approveMakeProject.call({
            makeProjectId: Template.instance().getCurrentMakeProject()._id
        }, (err, res) => {
            if (err) {
                throwError('There was an error while approving this project');
            }
            else {
                console.log(res);
            }
        });
    },
});

Template.make_project_names_list.events({

});

Template.make_project_edit_page.events({
    'submit form.js-edit-makeProject-form': (e) => {
        e.preventDefault();

        let currentMakeProjectId = Template.instance().getCurrentMakeProject()._id;

        //NOTE: this is, for now, directly copied from the _submit_ template's event function.
        if (!Meteor.user()) {
            throwError("You need to be signed in to edit a project.");
        }
        else {
            stepUpload: {
                let stopUpload = false;  //NOTE: this flag is used to break out of the entire upload process in case there are issues with the images.

                let $target = $(e.target);
                let makeProjectName = $target.find('[name=makeProjectName]').val();
                let ingredients = $target.find('[name=ingredients]').val();

                let steps = [];
                let stepUploadedIdx = 0;  //NOTE: relying on the top each() funciton's "idx" parameter caused a lot of unclear bugs due to Cloudinary's async upload
                let numSteps = $target.find('.single-step').length;

                let stepOrder = [];  //NOTE: this will be pushed to in the uploadCoverPhotoAndInsert() method so we know which order the steps finished uploading, and can then re-order them.
                let indexedSteps = [];

                $target.find('.single-step').each(function(idx) {
                    let stepText = $(this).find('.step-text').first().val();
                    let imageLinks = [];

                    $(this).find("input[type='file']").each(function(idx2) {
                        let files = this.files;

                        for (let i = 0; i < files.length; i++) {
                            if (files[i].size > 6000000) {
                                throwError("Sorry, one of your images is bigger than the 6MB upload limit");
                                stopUpload = true;
                                return;
                            }
                        }

                        if (files.length > UPLOAD_LIMITS.makeProjectStepImages) {  //NOTE: this doesn't nicely account for if the user uploads multiple "cover photos", but it'll throw a data error before inserting regardless.
                            throwError("Sorry, you are trying to upload " + files.length.toString() + " images in step " + (idx+1) + ".  The maximum you can upload is " + UPLOAD_LIMITS.makeProjectStepImages + ".");
                            stopUpload = true;
                            return;
                        }
                        else if (files.length > 0) {
                            //user is uploading an image
                            Session.set('isMakeProjectUploading', true);

                            let fileIndex = 0;
                            Cloudinary.upload(files, {
                                folder: "flippedart",
                                upload_preset: "limitsize"
                            }, (error, result) => {
                                if (error) {
                                    throwError(error.reason);
                                }

                                imageLinks.push(result.public_id);

                                fileIndex++;  //hack to only insert the post after all photos are uploaded

                                if (fileIndex >= files.length) {
                                    //Session.set('isMakeProjectUploading', false);

                                    steps.push({
                                        text: stepText,
                                        imageLinks: imageLinks
                                    });

                                    stepUploadedIdx++;
                                    uploadCoverPhotoAndInsert(stepUploadedIdx, idx);
                                }
                            });
                        }
                        else {
                            //no images
                            //Session.set('isMakeProjectUploading', false);

                            steps.push({
                                text: stepText,
                                imageLinks: imageLinks
                            });

                            stepUploadedIdx++;
                            uploadCoverPhotoAndInsert(stepUploadedIdx, idx);
                        }
                    });

                    //uploadCoverPhotoAndInsert(stepUploadedIdx);
                });

                if (stopUpload) {
                    //NOTE: this is hacky, and may upload more photos unnecessarily -- I'd much prefer to be able to call "break stepUpload" at the point where I throwError().
                    console.log('Stopping upload.');
                    break stepUpload;
                }

                function uploadCoverPhotoAndInsert(stepUploadedIdx=-1, stepIdx) {
                    /*
                     NOTE: rather than using some obscure JS to bind this function to a
                     variable iterator's value change, keep track of the steps as we go
                     along.  Per this first if-block, only execute the coverPhoto upload
                     function and the subsequent insert() server method after the last
                     step's photos have finished uploading.  If we didn't do this, and
                     instead called the following code inline, it may not allow some of
                     steps' photos to finish uploading before inserting() the makeProject
                     into the DB (since the Cloudinary API is async).  This forces a
                     synchronous insertion.

                     stepUploadedIdx refers to the order in which the steps' photos finished
                     uploading, while stepIdx refers to the order of the steps on the page.
                    */

                    stepOrder.push(stepIdx);

                    let tempObj = {};
                    tempObj[stepIdx] = steps[steps.length-1];
                    indexedSteps.push(tempObj);

                    if (stepUploadedIdx >= numSteps) {

                        // re-order steps (which could have been mixed up due to uploads
                        // completing at different times) back to their original order,
                        // using the stepOrder array that kept track of which order the
                        // uploads completed.
                        indexedSteps.sort((a,b) => {
                            if (Object.keys(a)[0] < Object.keys(b)[0])
                                return -1;
                            if (Object.keys(a)[0] > Object.keys(b)[0])
                                return 1;
                            return 0;
                        });
                        for (let i in steps) {
                            //pull the values one level out (or, good gracious that took a long time to debug...)
                            steps[i] = Object.values(Object.values(indexedSteps[i]))[0];
                        }

                        //upload cover photo here.
                        let coverImageLinks = [];

                        $("#coverPhotoUploadWrap input[type='file']").each(function () {
                            let files = this.files;

                            for (var i = 0; i < files.length; i++) {
                                if (files[i].size > 6000000) {
                                    throwError("Sorry, your image is bigger than the 6MB upload limit");
                                    return;
                                }
                            }

                            if (files.length > 1) {  //NOTE: just allow one cover photo per makeProject (as in calendarEvents).
                                throwError("Sorry, you are trying to upload " + files.length.toString() + " cover images.  The maximum you can upload is " + 1 + ".");
                            }
                            else if (files.length > 0) {
                                //user is uploading a cover image
                                Session.set('isMakeProjectUploading', true);

                                var fileIndex = 0;
                                Cloudinary.upload(files, {
                                    folder: "flippedart",
                                    upload_preset: "limitsize"
                                }, function (error, result) {
                                    if (error) {
                                        throwError(error.reason);
                                    }

                                    coverImageLinks.push(result.public_id);

                                    fileIndex++;  //hack to only insert the post after all photos are uploaded

                                    if (fileIndex >= files.length) {

                                        edit.call({
                                            makeProjectId: currentMakeProjectId,
                                            makeProjectName: makeProjectName,
                                            ingredients: ingredients,
                                            steps: steps,
                                            coverImageLink: coverImageLinks[0],  //NOTE: only using one photo per makeProject, for now
                                        }, (err, res) => {
                                            if (err) {
                                                throwError(err.reason);
                                                Session.set('isMakeProjectUploading', false);
                                            }
                                            else {
                                                Session.set('isMakeProjectUploading', false);

                                                FlowRouter.go('makeProjects.add.thanks', {wasEdited: 'edited'});
                                            }
                                        });
                                    }
                                });
                            }
                            else {
                                //no images
                                edit.call({
                                    makeProjectId: currentMakeProjectId,
                                    makeProjectName: makeProjectName,
                                    ingredients: ingredients,
                                    steps: steps,
                                    coverImageLink: " "
                                }, (err, res) => {
                                    if (err) {
                                        throwError(err.reason);
                                    }
                                    else {
                                        Session.set('isMakeProjectUploading', false);

                                        FlowRouter.go('makeProjects.add.thanks', {wasEdited: 'edited'});
                                    }
                                });
                            }
                        });
                    }
                }
            }
        }
    },
    'keyup textarea[type=text], keydown textarea[type=text], change textarea[type=text]'(event) {
        autosize($('textarea'));
    },
    'change input.stepFileUpload'(e) {
        e.preventDefault();

        /*
         Source: http://tympanus.net/codrops/2015/09/15/styling-customizing-file-inputs-smart-way/
         */

        var $input = $(e.target);  //NOTE: this is changed from explicitly selecting $(input#stepFileUpload), since there are multiple upload options.
        var $label = $input.next('label');
        var labelVal = $label.html();
        var fileName = '';

        if (e.target.files && e.target.files.length > 1) {
            fileName = ( e.target.getAttribute('data-multiple-caption') || '' ).replace('{count}', e.target.files.length);

            if (e.target.files.length > UPLOAD_LIMITS.makeProjectStepImages) {
                fileName += " (max " + UPLOAD_LIMITS.makeProjectStepImages + ")";
            }
        }
        else if (e.target.value) {
            fileName = e.target.value.split('\\').pop();
        }

        if (fileName) {
            $label.find('span').html(fileName);
        }
        else {
            $label.html(labelVal);
        }
    },
    'click .js-makeProject-delete': (e) => {
        e.preventDefault();

        let currentProject = Template.instance().getCurrentMakeProject();

        if (currentProject && confirm("Are you sure you want to delete this project?")) {
            deleteMakeProject.call({
                makeProjectId: currentProject._id,
            }, (err, res) => {
                if (err) {
                    throwError(err.reason);
                }
                else {
                    FlowRouter.go('makeProjects.page');
                }
            });
        }
    },
    'click .js-add-step': (e) => {
        e.preventDefault();

        let steps = Template.instance().steps.get();
        if (steps.length < UPLOAD_LIMITS.makeProjectSteps) {
            /*
                NOTE: on the edit page, the "steps" ReactiveVar is pre-populated
                 in onCreate() with {text, imageLinks} objects instead of numbers.
                 The code below, pushing a new step with a +1 value works as it
                 simply adds the string "1" to the end of the "[Object object]" string.
                 This looks wonky/ugly, but is consistent with the _submit_ template's
                 code for adding new steps, and still functions properly.
            */
            steps.push(steps[steps.length-1] + 1);  //increment the next step number.
        }
        Template.instance().steps.set(steps);

        //TODO: auto-focus the next step's textarea
    },
});

Template.make_project_submit_page.events({
    'click .js-add-step': (e) => {
        e.preventDefault();

        let steps = Template.instance().steps.get();
        if (steps.length < UPLOAD_LIMITS.makeProjectSteps) {
            steps.push(steps[steps.length-1] + 1);  //increment the next step number.
        }
        Template.instance().steps.set(steps);

        //TODO: auto-focus the next step's textarea
    },
    'submit form.js-submit-makeProject-form': (e) => {
        e.preventDefault();

        if (!Meteor.user()) {
            throwError("You need to be signed in to add a project.");
        }
        else {
            stepUpload: {
                let stopUpload = false;  //NOTE: this flag is used to break out of the entire upload process in case there are issues with the images.

                let $target = $(e.target);
                let makeProjectName = $target.find('[name=makeProjectName]').val();
                let ingredients = $target.find('[name=ingredients]').val();

                let steps = [];
                let stepUploadedIdx = 0;  //NOTE: relying on the top each() funciton's "idx" parameter caused a lot of unclear bugs due to Cloudinary's async upload
                let numSteps = $target.find('.single-step').length;

                $target.find('.single-step').each(function(idx) {
                    let stepText = $(this).find('.step-text').first().val();
                    let imageLinks = [];
                    $(this).find("input[type='file']").each(function(idx2) {
                        let files = this.files;

                        for (let i = 0; i < files.length; i++) {
                            if (files[i].size > 6000000) {
                                throwError("Sorry, one of your images is bigger than the 6MB upload limit");
                                stopUpload = true;
                                return;
                            }
                        }

                        if (files.length > UPLOAD_LIMITS.makeProjectStepImages) {  //NOTE: this doesn't nicely account for if the user uploads multiple "cover photos", but it'll throw a data error before inserting regardless.
                            throwError("Sorry, you are trying to upload " + files.length.toString() + " images in step " + (idx+1) + ".  The maximum you can upload is " + UPLOAD_LIMITS.makeProjectStepImages + ".");
                            stopUpload = true;
                            return;
                        }
                        else if (files.length > 0) {
                            //user is uploading an image
                            Session.set('isMakeProjectUploading', true);

                            let fileIndex = 0;
                            Cloudinary.upload(files, {
                                folder: "flippedart",
                                upload_preset: "limitsize"
                            }, (error, result) => {
                                if (error) {
                                    throwError(error.reason);
                                }

                                imageLinks.push(result.public_id);

                                fileIndex++;  //hack to only insert the post after all photos are uploaded

                                if (fileIndex >= files.length) {
                                    //Session.set('isMakeProjectUploading', false);

                                    steps.push({
                                        text: stepText,
                                        imageLinks: imageLinks
                                    });

                                    stepUploadedIdx++;
                                    uploadCoverPhotoAndInsert(stepUploadedIdx);
                                }
                            });
                        }
                        else {
                            //no images
                            //Session.set('isMakeProjectUploading', false);

                            steps.push({
                                text: stepText,
                                imageLinks: imageLinks
                            });

                            stepUploadedIdx++;
                            uploadCoverPhotoAndInsert(stepUploadedIdx);
                        }
                    });
                });

                if (stopUpload) {
                    //NOTE: this is hacky, and may upload more photos unnecessarily -- I'd much prefer to be able to call "break stepUpload" at the point where I throwError().
                    console.log('Stopping upload.');
                    break stepUpload;
                }

                function uploadCoverPhotoAndInsert(stepIdx=-1) {
                    /*
                     NOTE: rather than using some obscure JS to bind this function to a
                     variable iterator's value change, keep track of the steps as we go
                     along.  Per this first if-block, only execute the coverPhoto upload
                     function and the subsequent insert() server method after the last
                     step's photos have finished uploading.  If we didn't do this, and
                     instead called the following code inline, it may not allow some of
                     steps' photos to finish uploading before inserting() the makeProject
                     into the DB (since the Cloudinary API is async).  This forces a
                     synchronous insertion.
                     */

                    if (stepIdx >= numSteps) {

                        //upload cover photo here.
                        let coverImageLinks = [];

                        $("#coverPhotoUploadWrap input[type='file']").each(function () {
                            let files = this.files;

                            for (var i = 0; i < files.length; i++) {
                                if (files[i].size > 6000000) {
                                    throwError("Sorry, your image is bigger than the 6MB upload limit");
                                    return;
                                }
                            }

                            if (files.length > 1) {  //NOTE: just allow one cover photo per makeProject (as in calendarEvents).
                                throwError("Sorry, you are trying to upload " + files.length.toString() + " cover images.  The maximum you can upload is " + 1 + ".");
                            }
                            else if (files.length > 0) {
                                //user is uploading a cover image
                                Session.set('isMakeProjectUploading', true);

                                var fileIndex = 0;
                                Cloudinary.upload(files, {
                                    folder: "flippedart",
                                    upload_preset: "limitsize"
                                }, function (error, result) {
                                    if (error) {
                                        throwError(error.reason);
                                    }

                                    coverImageLinks.push(result.public_id);

                                    fileIndex++;  //hack to only insert the post after all photos are uploaded

                                    if (fileIndex >= files.length) {

                                        insert.call({
                                            makeProjectName: makeProjectName,
                                            ingredients: ingredients,
                                            steps: steps,
                                            coverImageLink: coverImageLinks[0],  //NOTE: only using one photo per makeProject, for now
                                        }, (err, res) => {
                                            if (err) {
                                                throwError(err.reason);
                                                Session.set('isMakeProjectUploading', false);
                                            }
                                            else {
                                                Session.set('isMakeProjectUploading', false);

                                                FlowRouter.go('makeProjects.add.thanks');
                                            }
                                        });
                                    }
                                });
                            }
                            else {
                                //no images
                                insert.call({
                                    makeProjectName: makeProjectName,
                                    ingredients: ingredients,
                                    steps: steps,
                                    coverImageLink: " "
                                }, (err, res) => {
                                    if (err) {
                                        throwError(err.reason);
                                    }
                                    else {
                                        Session.set('isMakeProjectUploading', false);

                                        FlowRouter.go('makeProjects.add.thanks');
                                    }
                                });
                            }
                        });
                    }

                }
            }
        }
    },
    'keyup textarea[type=text], keydown textarea[type=text], change textarea[type=text]'(event) {
        autosize($('textarea'));
    },
    'change input.stepFileUpload'(e) {
        e.preventDefault();

        /*
         Source: http://tympanus.net/codrops/2015/09/15/styling-customizing-file-inputs-smart-way/
        */

        var $input = $(e.target);  //NOTE: this is changed from explicitly selecting $(input#stepFileUpload), since there are multiple upload options.
        var $label = $input.next('label');
        var labelVal = $label.html();
        var fileName = '';

        if (e.target.files && e.target.files.length > 1) {
            fileName = ( e.target.getAttribute('data-multiple-caption') || '' ).replace('{count}', e.target.files.length);

            if (e.target.files.length > UPLOAD_LIMITS.makeProjectStepImages) {
                fileName += " (max " + UPLOAD_LIMITS.makeProjectStepImages + ")";
            }
        }
        else if (e.target.value) {
            fileName = e.target.value.split('\\').pop();
        }

        if (fileName) {
            $label.find('span').html(fileName);
        }
        else {
            $label.html(labelVal);
        }
    }
});

Template.make_project_edit_step_input.events({
    'click .js-remove-step': (e) => {
        e.preventDefault();

        let stepIndex = Template.instance().data.index;
        let parentSteps = Template.instance().parent().steps;

        parentSteps.get().splice(stepIndex, 1);

        parentSteps.set(parentSteps.get());
    }
});

Template.make_project_submit_step_input.events({
    'click .js-remove-step': (e) => {
        e.preventDefault();

        let stepIndex = Template.instance().data.index;
        let parentSteps = Template.instance().parent().steps;
        parentSteps.get().splice(stepIndex, 1);

        parentSteps.set(parentSteps.get());
    }
});
