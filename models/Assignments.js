const { v4: uuidv4 } = require('uuid');
const { Deferrable } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    //create table
    const Assignments = sequelize.define('Assignments', {
        dueDate: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        weight: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        difficulty: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        priority: {
            type: DataTypes.INTEGER,
            allowNull: false
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