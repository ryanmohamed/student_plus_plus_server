const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
    //create table
    const Courses = sequelize.define('Courses', {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        runningTotal: {
            type: DataTypes.FLOAT,
            allowNull: true,
            defaultValue: 0.0
        },
        cummulativeTotal: {
            type: DataTypes.FLOAT,
            allowNull: true,
            defaultValue: 0.0
        },
        perfectTotal: { 
            type: DataTypes.FLOAT,
            allowNull: true,
            defaultValue: 0.0
        },
        gpa: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: 'NA'
        },
        id: { //each course must have a unique id bc multiple users may share the same course
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: function() {
                return uuidv4();
            }
        }

    });

    Courses.associate = (models) => {
        Courses.hasMany(models.Assignments, {
            onDelete: 'cascade'
        });
        Courses.hasMany(models.Categories, {
            onDelete: 'cascade'
        });
    };

    return Courses;
}