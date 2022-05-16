const { v4: uuidv4 } = require('uuid');
const { Deferrable } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    //create table
    const Categories = sequelize.define('Categories', {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        weight: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    });
    return Categories;
}