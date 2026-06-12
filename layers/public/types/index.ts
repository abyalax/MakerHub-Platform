import type { Category } from '~/layers/projects/types';
import type { ContentAccessType } from '~/layers/shared/app/common/enum';

export interface ProjectPublicContentNode {
  type?: string;
  attrs?: Record<string, unknown>;
  content?: ProjectPublicContentNode[];
  text?: string;
}

export interface ProjectPublic {
  id: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  contentJson?: ProjectPublicContentNode | null;
  tocJson: {
    id: string;
    level: number;
    title: string;
  }[];
  accessType: ContentAccessType;
  price: number;
  currency: string;
  publishedAt: null | string;
  coverUrl: string;
  category: Category;
  mentor: {
    id: string;
    name: string;
    headline: string;
  };
  objectives?: string[];
}
