const fs = require("node:fs")

const filePath = "ge2025/search/testList.json"
const testJson = fs.readFileSync(filePath, "utf-8")

const testList = JSON.parse(testJson)


function searchTest(testList) {
    const testTitles = document.querySelector(".test-titles")

    testList.map(test => {
        const testTitle = document.createElement("li")
        testTitle.textContent = test.title
        testTitles.appendChild(testTitle)
        console.log("testTitle")
        console.log(test.title)
    })
}

searchTest(testList)