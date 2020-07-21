import * as path from "path";
import * as assert from "assert";
import * as ttm from "azure-pipelines-task-lib/mock-test";
import fs = require("fs");

describe("Sample task tests", function () {
  before(function () { });

  after(() => { });

  it("it should fail if tool returns 1", function (done: MochaDone) {
    this.timeout(2000);

    let tp = path.join(__dirname, "failure.js");
    let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

    tr.run();
    // assert.equal(tr.succeeded, false, "should have failed");
    assert.equal(tr.warningIssues, 0, "should have no warnings");
    assert.equal(tr.errorIssues.length, 2, "should have 2 error issues");
    assert.equal(tr.errorIssues[0], "Input required: project");
    assert.equal(tr.errorIssues[1], "Input required: prefix");

    done();
  });
});
