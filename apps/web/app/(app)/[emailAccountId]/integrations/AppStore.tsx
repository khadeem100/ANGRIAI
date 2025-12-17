"use client";

import { useState, useMemo } from "react";
import { LoadingContent } from "@/components/LoadingContent";
import { useIntegrations } from "@/hooks/useIntegrations";
import { IntegrationCard } from "@/app/(app)/[emailAccountId]/integrations/IntegrationCard";
import { Input } from "@/components/ui/input";
import { Search, Filter, Grid3x3, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AppStore() {
  const { data, isLoading, error, mutate } = useIntegrations();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const integrations = data?.integrations || [];

  const uiError = error
    ? { error: error instanceof Error ? error.message : "An error occurred" }
    : undefined;

  // Get description from displayName or generate one
  const getDescription = (integration: (typeof integrations)[number]) => {
    return `Connect ${integration.displayName} to enhance your workflow with powerful automation and data sync capabilities.`;
  };

  // Filter integrations based on search and category
  const filteredIntegrations = useMemo(() => {
    return integrations.filter((integration) => {
      const description = getDescription(integration);
      const matchesSearch =
        integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        integration.displayName
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        categoryFilter === "all" ||
        (categoryFilter === "installed" && integration.connection) ||
        (categoryFilter === "available" && !integration.connection);

      return matchesSearch && matchesCategory;
    });
  }, [integrations, searchQuery, categoryFilter]);

  // Get counts for categories
  const installedCount = integrations.filter((i) => i.connection).length;
  const availableCount = integrations.filter((i) => !i.connection).length;

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search integrations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Category Filter */}
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              All Apps ({integrations.length})
            </SelectItem>
            <SelectItem value="installed">
              Installed ({installedCount})
            </SelectItem>
            <SelectItem value="available">
              Available ({availableCount})
            </SelectItem>
          </SelectContent>
        </Select>

        {/* View Mode Toggle */}
        <div className="flex gap-1 rounded-lg border p-1">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className="gap-2"
          >
            <Grid3x3 className="h-4 w-4" />
            <span className="hidden sm:inline">Grid</span>
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="gap-2"
          >
            <List className="h-4 w-4" />
            <span className="hidden sm:inline">List</span>
          </Button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        <div>
          <span className="font-semibold text-foreground">
            {filteredIntegrations.length}
          </span>{" "}
          apps
        </div>
        <div className="h-4 w-px bg-border" />
        <div>
          <span className="font-semibold text-green-600">{installedCount}</span>{" "}
          installed
        </div>
        <div className="h-4 w-px bg-border" />
        <div>
          <span className="font-semibold text-blue-600">{availableCount}</span>{" "}
          available
        </div>
      </div>

      {/* Integrations Grid/List */}
      <LoadingContent loading={isLoading} error={uiError}>
        {filteredIntegrations.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              No integrations found
            </h3>
            <p className="text-muted-foreground">
              {searchQuery
                ? "Try adjusting your search or filters"
                : "No integrations available at the moment"}
            </p>
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }
          >
            {filteredIntegrations.map((integration) => (
              <IntegrationCard
                key={integration.name}
                integration={integration}
                onConnectionChange={mutate}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}
      </LoadingContent>
    </div>
  );
}
