import { Meteor } from 'meteor/meteor';
import { MakeProjects } from '../make-projects.js';


//NOTE: only use on admin
Meteor.publish('makeProjects.all', function (options) {
    check(options, {
        sort: Object,
    });

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

    return MakeProjects.find(
        {},
        {
            sort: options.sort,
            fields: {
                makeProjectName: 1,
            },
            //TODO: optional limit parameter
        }
    );
});

Meteor.publish('makeProjects.single', function (projectId) {
    check(projectId, String);

    return MakeProjects.find(projectId,
        {
            fields: MakeProjects.publicFields,
        });
});
