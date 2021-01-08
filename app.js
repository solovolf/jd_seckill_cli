#!/usr/bin/env node
const inquirer = require("inquirer");
const chalk = require("chalk");
const { jd_buy, jd_yuyue } = require("./jd_seckill");
const config = require("./config");

function action(answers) {
    switch (answers.action) {
        case "预约":
            jd_yuyue(config);
            break;
        case "抢购":
            jd_buy(config);
            break;

        default:
            break;
    }
}

inquirer
    .prompt([
        {
            type: "input",
            name: "id_buy.itemUrl",
            message: "需要抢购的商品URL",
            default: config.item_url,
        },
        {
            type: "password",
            name: "id_buy.password",
            message: "生成订单需要的密码, 不写密码，最后一步无法生成订单 ",
        },
        {
            type: "rawlist",
            name: "action",
            message: "选择需要执行的操作",
            choices: [
                {
                    index: 1,
                    value: "抢购",
                },
                {
                    index: 0,
                    value: "预约",
                },
            ],
            default: 0,
        },
        {
            type: "rawlist",
            name: "rightNow",
            message: "立即执行还是预约",
            choices: [
                {
                    index: 1,
                    value: "立即执行",
                },
                {
                    index: 0,
                    value: "预约",
                },
            ],
            default: 0,
        },
    ])
    .then((answers) => {
        if (answers.id_buy.itemUrl) {
            config.item_url = answers.id_buy.itemUrl;
        }

        if (answers.id_buy.password) {
            config.password = answers.id_buy.password;
        } else {
            if (!config.password && answers.action == "抢购") {
                console.log(chalk.red("请填写生成订单需要的密码"));
                return;
            }
        }
        if (!config.cookie) {
            console.log(chalk.red("请填写cookie"));
            return;
        }
        if (answers.rightNow === "立即执行") {
            action(answers);
        } else {
            var cur = new Date();
            if (isNaN(config.startTime)) {
                console.log("配置文件中填写时间后才能预约");
                return;
            } else if (cur.getTime() > config.startTime) {
                console.log("填写的时间已经过了");
                return;
            }

            console.log("开始预约时间");
            let interval = setInterval(() => {
                cur = new Date();
                if (cur.getTime() > config.startTime) {
                    console.log("预定时间开始");
                    action(answers);
                    clearInterval(interval);
                }
            }, 1000);
        }
    })
    .catch((error) => {
        console.log(chalk.red(error));
    });
