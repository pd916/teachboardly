import { Button } from "@/components/ui/button"
import { Users, DollarSign, TrendingUp, BarChart3 } from "lucide-react"
import { getTotalUsers, newUsers, totalEarning } from "@/lib/admin-panel-service"
import TotalUsers from "../_component/total-users"
import Chart from "../_component/chart";


export default async function AdminDashboard() {

const users = await getTotalUsers();
const count = await totalEarning();
const usersData = await newUsers();



  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 bg-sidebar border-r border-sidebar-border">
        <div className="p-6">
          <h1 className="text-xl font-bold text-sidebar-foreground">Admin Panel</h1>
        </div>

        <nav className="px-4 space-y-2">
          <Button
            // variant={activeTab === "dashboard" ? "default" : "ghost"}
            // className={`w-full justify-start gap-3 ${
            //   activeTab === "dashboard"
            //     ? "bg-sidebar-primary text-sidebar-primary-foreground"
            //     : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            // }`}
            // onClick={() => setActiveTab("dashboard")}
          >
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </Button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground">Dashboard Overview</h2>
          <p className="text-muted-foreground mt-2">Monitor your platform's key metrics and user growth</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Users Card */}
          <TotalUsers
           title="Total Users"
            value={users.length}
            icon={<Users/>}
            subtitle="+12.5% from last month"
         
          />

          {/* Total Earnings Card */}
          <TotalUsers
           title="Total Earnings"
            value={count}
            icon={<DollarSign/>}
            subtitle="+8.2% from last month"
         
          />

          {/* Monthly New Users Card */}
          <TotalUsers
           title="New Users"
            value={usersData.length}
            icon={<TrendingUp/>}
            subtitle="+14.3% from last month"
         
          />
        </div>

        {/* Chart Section */}
        <Chart
        usersData={usersData}
        />
      </div>
    </div>
  )
}
