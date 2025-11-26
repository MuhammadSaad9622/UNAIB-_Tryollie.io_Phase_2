import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Target,
  Clock,
  MessageCircle,
  Award,
} from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { APIService } from "../lib/api";

// Define interfaces for our data types
interface AnalyticsData {
  totalCalls: number;
  successRate: number;
  averageDuration: number;
  aiSuggestionsUsedRate: number;
  dailyCallData: DailyCallData[];
  recentCalls: RecentCall[];
}

interface DailyCallData {
  date: string;
  calls: number;
  successRate: number;
}

interface RecentCall {
  id: string;
  title: string;
  duration: number;
  status: string;
  score: number;
  createdAt: string;
}

interface PerformanceData {
  date: string;
  suggestions: number;
  formattedDate?: string;
}

interface SuggestionType {
  name: string;
  value: number;
  color: string;
}

export const AnalyticsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "3m">("30d");
  const [loading, setLoading] = useState<boolean>(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [callsData, setCallsData] = useState<any[]>([]);
  const [suggestionData, setSuggestionData] = useState<SuggestionType[]>([]);

  // Format duration in minutes and seconds
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Calculate percentage change
  const calculateChange = (current: number, previous: number): string => {
    if (previous === 0) return "+0%";
    const change = ((current - previous) / previous) * 100;
    return `${change > 0 ? "+" : ""}${change.toFixed(1)}%`;
  };

  // Fetch analytics data
  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // Fetch dashboard analytics
      const dashboardResponse = await APIService.getDashboardAnalytics(
        timeRange
      );
      if (dashboardResponse.success) {
        setAnalyticsData(dashboardResponse.data);
        console.log(dashboardResponse.data);

        // Process daily call data for the chart
        const processedCallsData = dashboardResponse.data.dailyCallData.map(
          (day: DailyCallData) => {
            const date = new Date(day.date);
            return {
              name: date.toLocaleDateString("en-US", { weekday: "short" }),
              calls: day.calls,
              successful: day.successRate,
              fullDate: day.date,
            };
          }
        );
        setCallsData(processedCallsData);

        // Process daily suggestions data for the performance chart
        if (dashboardResponse.data.dailySuggestionsData) {
          const processedSuggestionsData =
            dashboardResponse.data.dailySuggestionsData.map(
              (day: { date: string; suggestions: number }) => {
                const date = new Date(day.date);
                return {
                  date: day.date,
                  suggestions: day.suggestions,
                  formattedDate: date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  }),
                };
              }
            );

          setPerformanceData(processedSuggestionsData);
        }

        // Process suggestions array for pie chart
        if (
          dashboardResponse.data.suggestions &&
          Array.isArray(dashboardResponse.data.suggestions)
        ) {
          const suggestionCounts: { [key: string]: number } = {};

          // Count occurrences of each suggestion type
          dashboardResponse.data.suggestions.forEach((suggestion: string) => {
            suggestionCounts[suggestion] =
              (suggestionCounts[suggestion] || 0) + 1;
          });

          // Define colors for each suggestion type
          const colorMap: { [key: string]: string } = {
            follow_up: "#3b82f6",
            question: "#10b981",
            closing: "#f59e0b",
            objection_handling: "#ef4444",
            pricing: "#8b5cf6",
            features: "#06b6d4",
            rapport: "#84cc16",
            benefits: "#f97316",
          };

          // Define display names for suggestion types
          const nameMap: { [key: string]: string } = {
            follow_up: "Follow Up",
            question: "Questions",
            closing: "Closing",
            objection_handling: "Objection Handling",
            pricing: "Pricing",
            features: "Features",
            rapport: "Rapport Building",
            benefits: "Benefits",
          };

          // Convert to chart format
          const processedSuggestionData = Object.entries(suggestionCounts).map(
            ([type, count]) => ({
              name:
                nameMap[type] ||
                type
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase()),
              value: count,
              percentage: Math.round(
                (count / dashboardResponse.data.suggestions.length) * 100
              ),
              color: colorMap[type] || "#64748b",
            })
          );

          // Sort by count in descending order
          processedSuggestionData.sort((a, b) => b.value - a.value);

          setSuggestionData(processedSuggestionData);
        } else {
          // Fallback to empty array if no suggestions data
          setSuggestionData([]);
        }
      }
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Prepare metrics data
  const metrics = analyticsData
    ? [
        {
          title: "Total Calls",
          value: analyticsData.totalCalls.toString(),
          change: "+12%", // This would ideally be calculated from previous period
          positive: true,
          icon: MessageCircle,
        },

        {
          title: "Avg Duration",
          value: formatDuration(analyticsData.averageDuration),
          change: "-1m 32s", // This would ideally be calculated from previous period
          positive: false,
          icon: Clock,
        },
        {
          title: "AI Usage",
          value: `${analyticsData.aiSuggestionsUsedRate}%`,
          change: "+7.8%", // This would ideally be calculated from previous period
          positive: true,
          icon: Award,
        },
      ]
    : [];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">
            Insights and performance metrics for your AI-assisted sales calls.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="3m">Last 3 months</option>
          </select>
          <Button variant="secondary">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {loading ? (
        // Loading state
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : analyticsData ? (
        <>
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
            {metrics.map((metric, index) => (
              <Card key={metric.title} hover>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                      <metric.icon className="h-6 w-6 text-primary-600" />
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-600">
                      {metric.title}
                    </p>
                    <div className="flex items-baseline">
                      <p className="text-2xl font-semibold text-gray-900">
                        {metric.value}
                      </p>
                      <span
                        className={`
                        ml-2 text-sm font-medium flex items-center
                        ${
                          metric.positive
                            ? "text-success-600"
                            : "text-error-600"
                        }
                      `}
                      >
                        {metric.positive ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        {metric.change}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Calls Overview */}
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Calls Overview
                </h3>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-primary-600 rounded-full mr-2" />
                    Total Calls
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-success-600 rounded-full mr-2" />
                    Successful
                  </div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={callsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="calls" fill="#3b82f6" />
                  <Bar dataKey="successful" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Performance Trend */}
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  AI Suggestions Trend
                </h3>
                <span className="text-sm text-gray-600">
                  Daily Suggestions Count
                </span>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="formattedDate"
                    tick={{ fontSize: 12 }}
                    interval={"preserveStartEnd"}
                  />
                  <YAxis domain={[0, "dataMax + 5"]} tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value: number) => [value, "Suggestions"]}
                    labelFormatter={(label: string) => `Date: ${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="suggestions"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: "#3b82f6", r: 4 }}
                    activeDot={{ r: 6, fill: "#1d4ed8" }}
                  />
                </LineChart>
              </ResponsiveContainer>
              {/* Show summary stats */}
              <div className="mt-4 flex justify-between text-sm text-gray-600">
                <span>
                  Total:{" "}
                  {performanceData.reduce(
                    (sum, item) => sum + item.suggestions,
                    0
                  )}{" "}
                  suggestions
                </span>
                <span>
                  Avg:{" "}
                  {performanceData.length > 0
                    ? Math.round(
                        performanceData.reduce(
                          (sum, item) => sum + item.suggestions,
                          0
                        ) / performanceData.length
                      )
                    : 0}{" "}
                  per day
                </span>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* AI Suggestions Breakdown */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                AI Suggestions Breakdown
              </h3>
              {suggestionData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={suggestionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {suggestionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number, name: string) => [
                          `${value} suggestions (${
                            suggestionData.find((item) => item.name === name)
                              ?.percentage || 0
                          }%)`,
                          name,
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2">
                    {suggestionData.map((item) => (
                      <div
                        key={item.name}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: item.color }}
                          />
                          <span>{item.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{item.value}</span>
                          <span className="text-gray-500">
                            ({item.percentage}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Total Suggestions:</span>{" "}
                      {suggestionData.reduce(
                        (sum, item) => sum + item.value,
                        0
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Award className="h-8 w-8 text-gray-400" />
                  </div>
                  <p>No AI suggestions data available</p>
                  <p className="text-xs mt-1">
                    Start making calls to see suggestion analytics
                  </p>
                </div>
              )}
            </Card>

            {/* Top Performers */}
            <div className="lg:col-span-2">
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Top Performers
                  </h3>
                  <Button variant="secondary" size="sm">
                    View All
                  </Button>
                </div>
                {analyticsData.recentCalls.length > 0 ? (
                  <div className="space-y-4">
                    {analyticsData.recentCalls.slice(0, 4).map((call) => {
                      // In a real app, you would have actual user data
                      // For now, we'll generate a name from the call title
                      const name = call.title.split(" ")[0] || "User";
                      const lastName = call.title.split(" ")[1] || "";
                      const fullName = `${name} ${lastName}`;

                      return (
                        <div
                          key={call.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center text-white font-medium">
                              {name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {fullName}
                              </p>
                              <p className="text-sm text-gray-600">
                                {new Date(call.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-6">
                            <div className="text-right">
                              <p className="font-medium text-gray-900">
                                {call.score}%
                              </p>
                              <p className="text-sm text-gray-600">Score</p>
                            </div>
                            <div
                              className={`
                              flex items-center text-sm font-medium
                              ${
                                call.score >= 75
                                  ? "text-success-600"
                                  : "text-error-600"
                              }
                            `}
                            >
                              {call.score >= 75 ? (
                                <TrendingUp className="h-3 w-3 mr-1" />
                              ) : (
                                <TrendingDown className="h-3 w-3 mr-1" />
                              )}
                              {call.score >= 75 ? "+" : "-"}
                              {Math.abs(call.score - 75)}%
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No call data available
                  </div>
                )}
              </Card>
            </div>
          </div>
        </>
      ) : (
        // Error state
        <div className="text-center py-12">
          <p className="text-lg text-gray-600">Failed to load analytics data</p>
          <Button
            variant="primary"
            className="mt-4"
            onClick={fetchAnalyticsData}
          >
            Retry
          </Button>
        </div>
      )}
    </div>
  );
};
