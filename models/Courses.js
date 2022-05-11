const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
    //create table
    const Courses = sequelize.define('Courses', {
        
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        gpa: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: 'NA'
        },
        grade: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0
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
    };

    return Courses;
}