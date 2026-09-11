using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BusinessPlanSimulator.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddModule3And4ParametrizationAndCosting : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AssetInvestments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    BusinessPlanId = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "varchar(150)", maxLength: 150, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Category = table.Column<int>(type: "int", nullable: false),
                    Unit = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    UnitValue = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    UsefulLifeYears = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AssetInvestments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AssetInvestments_BusinessPlans_BusinessPlanId",
                        column: x => x.BusinessPlanId,
                        principalTable: "BusinessPlans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "BusinessPlanSettings",
                columns: table => new
                {
                    BusinessPlanId = table.Column<int>(type: "int", nullable: false),
                    MarketArea = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    MonthlyPayrollExpense = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    EmployerTaxRate = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    InatecTaxRate = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    ChristmasBonusRate = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    SeveranceRate = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    VacationRate = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    OtherProvisionsRate = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    StartYear = table.Column<int>(type: "int", nullable: false),
                    CollectionDays = table.Column<int>(type: "int", nullable: false),
                    SupplierPaymentDays = table.Column<int>(type: "int", nullable: false),
                    DebtTermYears = table.Column<int>(type: "int", nullable: false),
                    SalesCommissionRate = table.Column<decimal>(type: "decimal(5,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BusinessPlanSettings", x => x.BusinessPlanId);
                    table.ForeignKey(
                        name: "FK_BusinessPlanSettings_BusinessPlans_BusinessPlanId",
                        column: x => x.BusinessPlanId,
                        principalTable: "BusinessPlans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "MacroeconomicParameters",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    BusinessPlanId = table.Column<int>(type: "int", nullable: false),
                    YearIndex = table.Column<int>(type: "int", nullable: false),
                    InflationRate = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    GdpGrowthRate = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    ReferenceInterestRate = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    RiskFreeRate = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    IncomeTaxRate = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    ProjectRiskPremium = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    TMAR = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    WACC = table.Column<decimal>(type: "decimal(5,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MacroeconomicParameters", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MacroeconomicParameters_BusinessPlans_BusinessPlanId",
                        column: x => x.BusinessPlanId,
                        principalTable: "BusinessPlans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "OperationalExpenses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    BusinessPlanId = table.Column<int>(type: "int", nullable: false),
                    Concept = table.Column<string>(type: "varchar(150)", maxLength: 150, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Year1 = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Year2 = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Year3 = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Year4 = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Year5 = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OperationalExpenses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OperationalExpenses_BusinessPlans_BusinessPlanId",
                        column: x => x.BusinessPlanId,
                        principalTable: "BusinessPlans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Products",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    BusinessPlanId = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "varchar(150)", maxLength: 150, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Description = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    BaseYearDemand = table.Column<int>(type: "int", nullable: false),
                    AnnualGrowthRate = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    TargetPriceCostRatio = table.Column<decimal>(type: "decimal(8,4)", nullable: false),
                    FinishedGoodsInventoryDays = table.Column<int>(type: "int", nullable: false),
                    BatchSize = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Products", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Products_BusinessPlans_BusinessPlanId",
                        column: x => x.BusinessPlanId,
                        principalTable: "BusinessPlans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "RawMaterials",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    BusinessPlanId = table.Column<int>(type: "int", nullable: false),
                    Description = table.Column<string>(type: "varchar(150)", maxLength: 150, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    UnitOfMeasure = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    UnitCost = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    RawMaterialInventoryDays = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RawMaterials", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RawMaterials_BusinessPlans_BusinessPlanId",
                        column: x => x.BusinessPlanId,
                        principalTable: "BusinessPlans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "ProductOverheads",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    ProductId = table.Column<int>(type: "int", nullable: false),
                    Concept = table.Column<string>(type: "varchar(150)", maxLength: 150, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    UnitOfMeasure = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    UnitCost = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    QuantityPerBatch = table.Column<decimal>(type: "decimal(18,4)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductOverheads", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductOverheads_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "ProductBOMs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    ProductId = table.Column<int>(type: "int", nullable: false),
                    RawMaterialId = table.Column<int>(type: "int", nullable: false),
                    QuantityPerBatch = table.Column<decimal>(type: "decimal(18,4)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductBOMs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductBOMs_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProductBOMs_RawMaterials_RawMaterialId",
                        column: x => x.RawMaterialId,
                        principalTable: "RawMaterials",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_AssetInvestments_BusinessPlanId",
                table: "AssetInvestments",
                column: "BusinessPlanId");

            migrationBuilder.CreateIndex(
                name: "IX_MacroeconomicParameters_BusinessPlanId",
                table: "MacroeconomicParameters",
                column: "BusinessPlanId");

            migrationBuilder.CreateIndex(
                name: "IX_OperationalExpenses_BusinessPlanId",
                table: "OperationalExpenses",
                column: "BusinessPlanId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductBOMs_ProductId",
                table: "ProductBOMs",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductBOMs_RawMaterialId",
                table: "ProductBOMs",
                column: "RawMaterialId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductOverheads_ProductId",
                table: "ProductOverheads",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_Products_BusinessPlanId",
                table: "Products",
                column: "BusinessPlanId");

            migrationBuilder.CreateIndex(
                name: "IX_RawMaterials_BusinessPlanId",
                table: "RawMaterials",
                column: "BusinessPlanId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AssetInvestments");

            migrationBuilder.DropTable(
                name: "BusinessPlanSettings");

            migrationBuilder.DropTable(
                name: "MacroeconomicParameters");

            migrationBuilder.DropTable(
                name: "OperationalExpenses");

            migrationBuilder.DropTable(
                name: "ProductBOMs");

            migrationBuilder.DropTable(
                name: "ProductOverheads");

            migrationBuilder.DropTable(
                name: "RawMaterials");

            migrationBuilder.DropTable(
                name: "Products");
        }
    }
}
