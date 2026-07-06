'use client';

import { Label } from '@/components/ui/label';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { generateQueryPath } from '@/utils';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const PaginatorComponent = ({
  pathParams,
  totalRecords = 10000,
}: {
  pathParams?: any | null;
  totalRecords?: number;
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const skip = searchParams.get('skip') ? parseInt(searchParams.get('skip')!) : 0;
  const take = searchParams.get('take') ? parseInt(searchParams.get('take')!) : 10;
  const page = Math.floor(skip / take) + 1;
  const totalPages = Math.ceil(totalRecords / take);

  const handlePageChange = (newPage: number) => {
    const newSkip = (newPage - 1) * take;
    const path = generateQueryPath(pathname, pathParams, {
      ...Object.fromEntries(searchParams.entries()),
      skip: newSkip.toString(),
      take: take.toString(),
    });
    router.push(path);
  };

  const handleRowsPerPageChange = (newTake: string) => {
    const newTakeNum = parseInt(newTake);
    const path = generateQueryPath(pathname, pathParams, {
      ...Object.fromEntries(searchParams.entries()),
      skip: '0',
      take: newTakeNum.toString(),
    });
    router.push(path);
  };

  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (page <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = page - 1; i <= page + 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <Label>Items per page:</Label>
        <Select value={take.toString()} onValueChange={handleRowsPerPageChange}>
          <SelectTrigger className="w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Page number: {page}</span>
      </div>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={e => {
                e.preventDefault();
                if (page > 1) handlePageChange(page - 1);
              }}
              className={page === 1 ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>

          {getPageNumbers().map((pageNum, index) => {
            if (pageNum === 'ellipsis') {
              return (
                <PaginationItem key={`ellipsis-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              );
            }

            return (
              <PaginationItem key={pageNum}>
                <PaginationLink
                  href="#"
                  onClick={e => {
                    e.preventDefault();
                    handlePageChange(pageNum);
                  }}
                  isActive={pageNum === page}
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            );
          })}

          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={e => {
                e.preventDefault();
                if (page < totalPages) handlePageChange(page + 1);
              }}
              className={page >= totalPages ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default PaginatorComponent;
