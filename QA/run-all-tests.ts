import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

async function main() {
  const startTime = Date.now();
  console.log("=================================================================");
  console.log("🏛️  Chronicle & Quill — Complete Full-Stack QA Suite");
  console.log("=================================================================");

  const { runPhase1Tests } = await import("./test-phase1-foundation");
  const { runPhase2Tests } = await import("./test-phase2-api");
  const { runFrontendTests } = await import("./test-frontend");
  const { runRBACTests } = await import("./test-rbac");
  const { runValidationTests } = await import("./test-validation");

  const p1Results = await runPhase1Tests();
  const p2Results = await runPhase2Tests();
  const feResults = await runFrontendTests();
  const rbacResults = await runRBACTests();
  const valResults = await runValidationTests();

  const allResults = [...p1Results, ...p2Results, ...feResults, ...rbacResults, ...valResults];
  const passed = allResults.filter((r) => r.passed).length;
  const failed = allResults.filter((r) => !r.passed).length;
  const durationMs = Date.now() - startTime;

  console.log("\n=================================================================");
  console.log("📈 Final Full-Stack QA Execution Report");
  console.log("=================================================================");
  console.log(`  Phase 1 Tests:    ${p1Results.filter((r) => r.passed).length}/${p1Results.length} Passed`);
  console.log(`  Phase 2 Tests:    ${p2Results.filter((r) => r.passed).length}/${p2Results.length} Passed`);
  console.log(`  Frontend Tests:   ${feResults.filter((r) => r.passed).length}/${feResults.length} Passed`);
  console.log(`  RBAC & Admin:     ${rbacResults.filter((r) => r.passed).length}/${rbacResults.length} Passed`);
  console.log(`  Validation Suite: ${valResults.filter((r) => r.passed).length}/${valResults.length} Passed`);
  console.log(`  Total Suite:      ${passed}/${allResults.length} Passed (${failed} Failed)`);
  console.log(`  Overall Accuracy: ${((passed / allResults.length) * 100).toFixed(1)}%`);
  console.log(`  Execution Time:   ${(durationMs / 1000).toFixed(2)}s`);
  console.log("=================================================================\n");

  if (failed > 0) {
    console.error(`🚨 ${failed} test(s) failed!`);
    process.exit(1);
  } else {
    console.log(`🎉 All ${allResults.length} Full-Stack QA verification checks passed successfully!`);
    process.exit(0);
  }
}

main().catch((err) => {
  console.error("Fatal test runner error:", err);
  process.exit(1);
});
