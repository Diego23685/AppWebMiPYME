using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BusinessPlanSimulator.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddBusinessPlanDetailedBasicData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AccountsPayableDays",
                table: "BusinessPlans",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "AccountsReceivableDays",
                table: "BusinessPlans",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "CompanyType",
                table: "BusinessPlans",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "DebtRepaymentYears",
                table: "BusinessPlans",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<decimal>(
                name: "LegalMinimumWage",
                table: "BusinessPlans",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "MarketArea",
                table: "BusinessPlans",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "PayrollTaxRate",
                table: "BusinessPlans",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "ProjectLifespanYears",
                table: "BusinessPlans",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<decimal>(
                name: "SalesCommissionRate",
                table: "BusinessPlans",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "SeveranceAndBenefitsRate",
                table: "BusinessPlans",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "SocialSecurityRate",
                table: "BusinessPlans",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "StartYear",
                table: "BusinessPlans",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<decimal>(
                name: "TransportationAllowance",
                table: "BusinessPlans",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AccountsPayableDays",
                table: "BusinessPlans");

            migrationBuilder.DropColumn(
                name: "AccountsReceivableDays",
                table: "BusinessPlans");

            migrationBuilder.DropColumn(
                name: "CompanyType",
                table: "BusinessPlans");

            migrationBuilder.DropColumn(
                name: "DebtRepaymentYears",
                table: "BusinessPlans");

            migrationBuilder.DropColumn(
                name: "LegalMinimumWage",
                table: "BusinessPlans");

            migrationBuilder.DropColumn(
                name: "MarketArea",
                table: "BusinessPlans");

            migrationBuilder.DropColumn(
                name: "PayrollTaxRate",
                table: "BusinessPlans");

            migrationBuilder.DropColumn(
                name: "ProjectLifespanYears",
                table: "BusinessPlans");

            migrationBuilder.DropColumn(
                name: "SalesCommissionRate",
                table: "BusinessPlans");

            migrationBuilder.DropColumn(
                name: "SeveranceAndBenefitsRate",
                table: "BusinessPlans");

            migrationBuilder.DropColumn(
                name: "SocialSecurityRate",
                table: "BusinessPlans");

            migrationBuilder.DropColumn(
                name: "StartYear",
                table: "BusinessPlans");

            migrationBuilder.DropColumn(
                name: "TransportationAllowance",
                table: "BusinessPlans");
        }
    }
}
