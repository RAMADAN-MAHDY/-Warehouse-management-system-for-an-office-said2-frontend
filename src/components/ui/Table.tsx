'use client';

import React, { createContext, useContext, useState } from 'react';
import { cn } from '@/lib/utils';

interface TableContextType {
  data: any[];
}

const TableContext = createContext<TableContextType | undefined>(undefined);

export function Table({ children, data, className, ...props }: React.TableHTMLAttributes<HTMLTableElement> & { data: any[] }) {
  return (
    <TableContext.Provider value={{ data }}>
      <div className={cn("overflow-x-auto glass rounded-xl border border-gray-700", className)}>
        <table className="w-full text-right border-collapse" {...props}>
          {children}
        </table>
      </div>
    </TableContext.Provider>
  );
}

export function TableHeader({ children, className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={cn("bg-gray-800/80 border-b border-gray-700", className)} {...props}>
      {children}
    </thead>
  );
}

export function TableBody({ children, className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={cn("divide-y divide-gray-700/50", className)} {...props}>
      {children}
    </tbody>
  );
}

export function TableRow({ children, className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr 
      className={cn("hover:bg-gray-800/40 transition-colors duration-200", className)}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableHead({ children, className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th 
      className={cn("px-6 py-4 text-sm font-semibold text-gray-200 uppercase tracking-wider", className)}
      {...props}
    >
      {children}
    </th>
  );
}

export function TableCell({ children, className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td 
      className={cn("px-6 py-4 whitespace-nowrap text-sm text-gray-300", className)}
      {...props}
    >
      {children}
    </td>
  );
}
