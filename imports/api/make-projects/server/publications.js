import { Meteor } from 'meteor/meteor';
import { MakeProjects } from '../make-projects.js';


//NOTE: only use on admin
Meteor.publish('makeProjects.all', function (options) {
    check(options, {
        sort: Object,
    });

    if (!this.userId) {
        return;
    }

    const adminUser = Meteor.users.findOne(this.userId);
    if (!_.contains(adminUser.roles, 'admin')) {
        return;
    }

    return MakeProjects.find(
        {},
        {
            sort: options.sort,
            fields: MakeProjects.publicFields,
            //TODO: optional limit parameter
        }
    );
});


//use this to list names of all MakeProjects on the main '/make' route.
Meteor.publish('makeProjects.all.names', function (options) {
    check(options, {
        sort: Object,
    });

    if (this.userId) {
        const adminUser = Meteor.users.findOne(this.userId);
        if (_.contains(adminUser.roles, 'admin')) {

            //Return all makeProjects, regardless of approval status, if the current user is an admin.
            return MakeProjects.find(
                {},
                {
                    sort: options.sort,
                    fields: {
                        makeProjectName: 1,
                        createdAt: 1,  //NOTE: this is necessary for sorting on the client
                    },
                    //TODO: optional limit parameter
                }
            );
        }
    }

    //If the user is either not signed in or not an admin, return only the makeProjects that have been marked "approved"
    return MakeProjects.find(
        {
            approved: true,
        },
        {
            sort: options.sort,
            fields: {
                makeProjectName: 1,
                createdAt: 1,  //NOTE: this is necessary for sorting on the client
            },
            //TODO: optional limit parameter
        }
    );
});

Meteor.publish('makeProjects.latest', function () {

    if (this.userId) {
        const adminUser = Meteor.users.findOne(this.userId);
        if (_.contains(adminUser.roles, 'admin')) {

            //Return the latest makeProject, regardless of approval status, if the current user is an admin.
            return MakeProjects.find(
                {},
                {
                    fields: MakeProjects.publicFields,
                    limit: 1,
                    sort: {
                        createdAt: -1,
                    }
                }
            );
        }
    }

    return MakeProjects.find(
        {
            approved: true,
        },
        {
            fields: MakeProjects.publicFields,
            limit: 1,
            sort: {
                createdAt: -1,
            }
        });
});


Meteor.publish('makeProjects.single.name', function (projectName) {
    check(projectName, String);

    if (this.userId) {
        const adminUser = Meteor.users.findOne(this.userId);
        if (_.contains(adminUser.roles, 'admin')) {

            //Return the makeProject, regardless of approval status, if the current user is an admin.
            return MakeProjects.find(
                {
                    makeProjectName: projectName,
                },
                {
                    fields: MakeProjects.publicFields,
                    limit: 1,
                });
        }
    }

    return MakeProjects.find(
        {
            makeProjectName: projectName,
            approved: true,
        },
        {
            fields: MakeProjects.publicFields,
            limit: 1,
        });
});
