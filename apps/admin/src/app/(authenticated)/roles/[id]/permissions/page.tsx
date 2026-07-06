'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { getPermissionCatalog, getRoleById, updateRolePermissions } from '@/apis';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, RefreshCcw, Search, ShieldCheck } from 'lucide-react';

type PermissionRecord = {
  id: number;
  action: string;
  label: string;
  description?: string | null;
};

type PermissionGroup = {
  subject: string;
  label: string;
  permissions: PermissionRecord[];
};

type RoleDetails = {
  id: number;
  name: string;
  description?: string | null;
  permissions: PermissionRecord[];
};

const PermissionMatrixSkeleton = () => (
  <div className="grid gap-4 md:grid-cols-2">
    {Array.from({ length: 4 }).map((_, index) => (
      <Card key={index}>
        <CardHeader>
          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-3 w-20 animate-pulse rounded bg-muted" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((__, innerIndex) => (
            <div key={innerIndex} className="flex items-start gap-3">
              <div className="mt-1 h-4 w-4 rounded border bg-muted" />
              <div className="space-y-2">
                <div className="h-4 w-40 animate-pulse rounded bg-muted" />
                <div className="h-3 w-56 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    ))}
  </div>
);

const Page = () => {
  const params = useParams();
  const roleId = Number(params.id);

  const [role, setRole] = useState<RoleDetails | null>(null);
  const [catalog, setCatalog] = useState<PermissionGroup[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const initialSelectionRef = useRef<Set<number>>(new Set());

  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalPermissions = useMemo(
    () => catalog.reduce((count, subject) => count + subject.permissions.length, 0),
    [catalog],
  );

  const actionOptions = useMemo(() => {
    const actions = new Set<string>();
    catalog.forEach(subject => {
      subject.permissions.forEach(permission => actions.add(permission.action));
    });

    return Array.from(actions).sort();
  }, [catalog]);

  const filteredCatalog = useMemo(() => {
    const normalizedQuery = searchTerm.trim().toLowerCase();

    return catalog
      .map(subject => {
        const filteredPermissions = subject.permissions.filter(permission => {
          const matchesQuery =
            normalizedQuery.length === 0 ||
            permission.label.toLowerCase().includes(normalizedQuery) ||
            permission.description?.toLowerCase().includes(normalizedQuery);
          const matchesAction = actionFilter === 'all' || permission.action === actionFilter;

          return matchesQuery && matchesAction;
        });

        return { ...subject, permissions: filteredPermissions };
      })
      .filter(subject => subject.permissions.length > 0);
  }, [catalog, searchTerm, actionFilter]);

  const isDirty = useMemo(() => {
    const initialSelection = initialSelectionRef.current;

    if (initialSelection.size !== selectedIds.size) {
      return true;
    }

    for (const id of selectedIds) {
      if (!initialSelection.has(id)) {
        return true;
      }
    }

    return false;
  }, [selectedIds]);

  const loadData = useCallback(async () => {
    if (!Number.isFinite(roleId)) {
      setError('Invalid role identifier');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [roleResponse, catalogResponse] = await Promise.all([
        getRoleById(roleId),
        getPermissionCatalog(),
      ]);

      if (roleResponse?.statusCode !== 200) {
        throw new Error(roleResponse?.message || 'Unable to load role');
      }

      if (catalogResponse?.statusCode !== 200) {
        throw new Error(catalogResponse?.message || 'Unable to load catalog');
      }

      const roleData = roleResponse.data as RoleDetails;
      const catalogData = catalogResponse.data as PermissionGroup[];
      const selected = new Set((roleData.permissions ?? []).map(permission => permission.id));

      setRole(roleData);
      setCatalog(catalogData);
      setSelectedIds(selected);
      initialSelectionRef.current = new Set(selected);
    } catch (err: any) {
      console.error('Failed to load permissions', err);
      setError(err?.message || 'Unable to load permission data');
    } finally {
      setIsLoading(false);
    }
  }, [roleId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePermissionToggle = useCallback(
    (permissionId: number, nextValue: boolean | 'indeterminate') => {
      setSelectedIds(previous => {
        const updated = new Set(previous);
        const shouldSelect = nextValue === true || nextValue === 'indeterminate';

        if (shouldSelect) {
          updated.add(permissionId);
        } else {
          updated.delete(permissionId);
        }

        return updated;
      });
    },
    [],
  );

  const handleSubjectToggle = useCallback((subject: PermissionGroup) => {
    setSelectedIds(previous => {
      const updated = new Set(previous);
      const permissionIds = subject.permissions.map(permission => permission.id);
      const allSelected = permissionIds.every(id => updated.has(id));

      if (allSelected) {
        permissionIds.forEach(id => updated.delete(id));
      } else {
        permissionIds.forEach(id => updated.add(id));
      }

      return updated;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    const everyPermissionId = catalog.flatMap(subject =>
      subject.permissions.map(permission => permission.id),
    );
    setSelectedIds(new Set(everyPermissionId));
  }, [catalog]);

  const handleClearAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const handleReset = useCallback(() => {
    setSelectedIds(new Set(initialSelectionRef.current));
  }, []);

  const handleSave = useCallback(async () => {
    if (!role || isSaving) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await updateRolePermissions(role.id, {
        permissionIds: Array.from(selectedIds),
      });

      if (response?.statusCode !== 200) {
        throw new Error(response?.message || 'Unable to update permissions');
      }

      const updatedRole = response.data as RoleDetails;
      const updatedSelection = new Set(
        (updatedRole.permissions ?? []).map(permission => permission.id),
      );

      setRole(updatedRole);
      setSelectedIds(updatedSelection);
      initialSelectionRef.current = new Set(updatedSelection);
    } catch (err: any) {
      console.error('Failed to update permissions', err);
      setError(err?.message || 'Something went wrong while saving changes');
    } finally {
      setIsSaving(false);
    }
  }, [role, isSaving, selectedIds]);

  const getSubjectSelectionState = useCallback(
    (subject: PermissionGroup) => {
      const total = subject.permissions.length;
      const selected = subject.permissions.filter(permission =>
        selectedIds.has(permission.id),
      ).length;

      if (selected === 0) return 'none';
      if (selected === total) return 'all';
      return 'partial';
    },
    [selectedIds],
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4" />
            Role permission designer
          </div>
          <div>
            <h1 className="text-2xl font-semibold">{role?.name ?? 'Loading role...'}</h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              {role?.description ||
                'Decide which actions this role can perform. Changes are applied instantly after saving.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Subjects: {catalog.length}</Badge>
            <Badge variant="outline">Total permissions: {totalPermissions}</Badge>
            <Badge>Selected: {selectedIds.size}</Badge>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleReset}
            disabled={!isDirty || isSaving}
          >
            <RefreshCcw className="h-4 w-4" />
            Reset
          </Button>
          <Button className="gap-2" onClick={handleSave} disabled={!isDirty || isSaving}>
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save changes
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative w-full max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search permission label or description"
            className="pl-9"
            value={searchTerm}
            onChange={event => setSearchTerm(event.target.value)}
          />
        </div>

        <div className="w-full max-w-[220px]">
          <Select value={actionFilter} onValueChange={value => setActionFilter(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Action filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All actions</SelectItem>
              {actionOptions.map(action => (
                <SelectItem key={action} value={action}>
                  {action}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="secondary"
          onClick={handleSelectAll}
          disabled={totalPermissions === 0 || selectedIds.size === totalPermissions}
        >
          Select all
        </Button>
        <Button variant="ghost" onClick={handleClearAll} disabled={selectedIds.size === 0}>
          Clear all
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {isLoading ? (
        <PermissionMatrixSkeleton />
      ) : filteredCatalog.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredCatalog.map(subject => {
            const selectionState = getSubjectSelectionState(subject);

            return (
              <Card key={subject.subject}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle className="text-lg capitalize">{subject.label}</CardTitle>
                    <CardDescription>{subject.permissions.length} actions</CardDescription>
                  </div>
                  <Checkbox
                    checked={
                      selectionState === 'all'
                        ? true
                        : selectionState === 'none'
                          ? false
                          : 'indeterminate'
                    }
                    onCheckedChange={() => handleSubjectToggle(subject)}
                    aria-label={`Toggle ${subject.label} permissions`}
                  />
                </CardHeader>
                <CardContent className="space-y-3">
                  {subject.permissions.map(permission => (
                    <label
                      key={permission.id}
                      className="flex cursor-pointer items-start gap-3 rounded-lg border border-transparent px-2 py-1 transition hover:border-muted"
                    >
                      <Checkbox
                        checked={selectedIds.has(permission.id)}
                        onCheckedChange={value => handlePermissionToggle(permission.id, value)}
                      />
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{permission.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {permission.description ||
                            `Allows ${permission.action} access on ${subject.label}`}
                        </p>
                      </div>
                    </label>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>No permissions matched</CardTitle>
            <CardDescription>
              Try clearing the search or selecting a different action filter.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
};

export default Page;
