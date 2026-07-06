import { Button } from '@/components/ui/button';
import copy from 'copy-to-clipboard';
import _ from 'lodash';
import { useCallback, useMemo } from 'react';

// Removed inline style - using Tailwind classes instead

const UrlBasedColumnItem = ({ url }: { url: string }) => {
  const getView = useCallback(() => {
    if (_.isUndefined(url) || _.isNull(url)) return null;

    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

    if (imageExtensions.some(ext => url.toLowerCase().endsWith('.' + ext))) {
      return (
        <a href={url} target="_blank" rel="noreferrer" className="w-[100px] h-auto overflow-auto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} width={100} alt="Preview" />
        </a>
      );
    }

    // Check for video extensions
    if (url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.ogg')) {
      return (
        <video src={url} controls className="w-[100px] h-auto">
          <track kind="captions" />
        </video>
      );
    }

    // Check for document extensions
    if (
      url.endsWith('.pdf') ||
      url.endsWith('.doc') ||
      url.endsWith('.docx') ||
      url.endsWith('.xls') ||
      url.endsWith('.xlsx') ||
      url.endsWith('.ppt') ||
      url.endsWith('.pptx') ||
      url.endsWith('.txt') ||
      url.endsWith('.csv')
    ) {
      return (
        <a href={url} target="_blank" rel="noreferrer" className="w-[100px] h-auto overflow-auto">
          Document
        </a>
      );
    }

    // Default case: display URL as a link
    return (
      <a href={url} target="_blank" rel="noreferrer" className="w-[100px] h-auto overflow-auto">
        {url}
      </a>
    );
  }, [url]);

  return useMemo(
    () => (
      <div className="flex-auto">
        {_.isUndefined(url) || _.isNull(url) ? null : getView()}
        <br />
        {_.isUndefined(url) || _.isNull(url) || _.isEqual(url, '') ? null : (
          <Button
            variant="outline"
            size="sm"
            className="mt-3 w-[100px]"
            onClick={e => {
              e.preventDefault();

              copy(url);
            }}
          >
            Copy Link
          </Button>
        )}
      </div>
    ),
    [url, getView],
  );
};

export default UrlBasedColumnItem;
