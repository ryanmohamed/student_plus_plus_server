const { v4: uuidv4 } = require('uuid');
const { Deferrable } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    //create table
    const Assignments = sequelize.define('Assignments', {
        courseName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        name: {
            // primaryKey: true, CANT BE PK BC OTHER ASSIGNMENTS CANT HAVE THE SAME
            type: DataTypes.STRING,
            allowNull: false
        },
        dueDate: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        perfectScore: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        difficulty: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        courseCategory: {
            type: DataTypes.STRING,
            allowNull: true
        },
        priority: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        completion: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false
        },
        scoreRecieved: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        estimatedCompletionTime: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    });
    return Assignments;
}