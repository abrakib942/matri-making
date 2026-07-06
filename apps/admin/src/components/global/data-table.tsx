'use client';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import _ from 'lodash';
import { Lightbulb, Mouse } from 'lucide-react';
import React from 'react';

export interface IAction {
  text?: string;
  icon?: React.ReactNode;
  color?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  tooltip?: string;
  callback: (identifier: string | number) => void;
}

const DataTable = ({
  data,
  ignoredColumns,
  scopedColumns,
  actionIdentifier = 'id',
  actions = [],
  emptyListText = null,
}: {
  data: any;
  ignoredColumns?: string[];
  scopedColumns?: any;
  actionIdentifier?: string;
  actions: IAction[];
  emptyListText?: string | null;
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead colSpan={100} className="text-center">
                {' '}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={100} className="text-center py-8">
                {emptyListText ?? (
                  <>
                    <h2 className="text-destructive text-lg font-semibold">Oops!</h2>
                    <p className="text-destructive">No data available!!</p>
                  </>
                )}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  const columns = _.map(_.keys(_.omit(data[0], [...(ignoredColumns ?? [])])), (key: string) => ({
    key,
    label: _.upperCase(key),
    body: scopedColumns?.[key],
  }));

  if (actions.length > 0) {
    columns.push({
      key: 'actions',
      label: 'ACTIONS',
      body: undefined,
    });
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map(column => (
              <TableHead
                key={column.key}
                className={column.key === 'actions' ? 'w-[120px]' : 'max-w-[200px]'}
                style={{
                  maxWidth: column.key === 'actions' ? '120px' : '200px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row: any, rowIndex: number) => (
            <TableRow key={rowIndex}>
              {columns.map(column => {
                if (column.key === 'actions') {
                  return (
                    <TableCell key={column.key} className="w-[120px]">
                      <div className="flex flex-col gap-2">
                        {actions.map((action, actionIndex) => {
                          const button = (
                            <Button
                              key={actionIndex}
                              variant={action.color || 'outline'}
                              size={action.text ? 'default' : 'icon'}
                              className={actionIndex !== 0 && action.text ? 'mt-2' : ''}
                              onClick={e => {
                                e.preventDefault();
                                action.callback(row[actionIdentifier]);
                              }}
                            >
                              {action.icon}
                              {action.text}
                            </Button>
                          );

                          return (
                            <div key={actionIndex} title={action.tooltip}>
                              {button}
                            </div>
                          );
                        })}
                      </div>
                    </TableCell>
                  );
                }

                const cellValue = column.body ? column.body(row) : row[column.key];

                return (
                  <TableCell
                    key={column.key}
                    className="max-w-[200px] overflow-hidden text-ellipsis whitespace-break-spaces"
                  >
                    {cellValue}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={columns.length} className="text-center">
              <p className="text-orange-500 flex items-center justify-center gap-2">
                <Lightbulb className="h-4 w-4" />
                {`"Did you know? You can scroll horizontally by holding down the Shift key and using your mouse scroll wheel. Try it out to navigate wide web pages or spreadsheets more easily!" - Rafi Hasnain`}
                <Mouse className="h-4 w-4" />
              </p>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
};

export default DataTable;
