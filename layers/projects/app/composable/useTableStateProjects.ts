import { useQueryClient } from '@tanstack/vue-query';
import { QUERY_KEY } from '~/layers/shared/app/common/const/querykey';
import { useInlineCrud } from '~/layers/shared/app/composable/table/states/useInlineCrud';
import type { Project } from '../../types'; // Added Role type import if needed
import { AssetKind, AssetVisibility, ContentAccessType, ContentStatus } from '~/layers/shared/app/common/enum';
import { useCreateProject } from './useCreateProjects';
import { useUpdateProject } from './useUpdateProjects';
import { useDeleteProject } from './useDeleteProjects';
import type { Role } from '~/layers/users/types';

export type EditableProject = Project & {
  isNewRow: boolean;
  roleIds?: number[]; // Added to accommodate temporary role selections if needed
};

export const useTableStateProjects = () => {
  const createProjectMutation = useCreateProject();
  const updateProjectMutation = useUpdateProject();
  const deleteProjectMutation = useDeleteProject();
  const queryClient = useQueryClient();

  const crud = useInlineCrud<EditableProject>({
    rowKey: 'id',
    maxNewRows: 5,
    maxSelectedRows: 5,

    createDefaultRow: () => ({
      id: 0,
      mentorId: 0,
      authorId: '',
      categoryId: 0,
      coverAssetId: 0,
      title: '',
      slug: '',
      summary: '',
      description: '',
      objectives: '',
      accessType: ContentAccessType.FREE,
      status: ContentStatus.DRAFT,
      price: '',
      currency: '',
      publishedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      mentor: {
        id: 0,
        userId: '',
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          id: 0,
          name: '',
          email: '',
          roles: [],
          permissions: [],
        },
        projects: [],
        classes: [],
        revenueShareRules: [],
        payouts: [],
        trafficEvents: [],
      },
      author: {
        id: 0,
        name: '',
        email: '',
        roles: [],
        permissions: [],
      },
      category: {
        id: 0,
        name: '',
        slug: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        projects: [],
        classes: [],
      },
      coverAsset: {
        id: '',
        ownerId: '',
        bucket: '',
        objectKey: '',
        originalFileName: '',
        mimeType: '',
        originalName: '',
        size: 0,
        assetKind: AssetKind.COVER_IMAGE,
        visibility: AssetVisibility.PRIVATE,
        createdAt: new Date(),
        updatedAt: new Date(),
        owner: {
          id: 0,
          name: '',
          email: '',
          roles: [],
          permissions: [],
        },
      },
      assets: [],
      assignments: [],
      bookmarks: [],
      classProjects: [],
      completionCriteria: [],
      entitlements: [],
      progress: [],
      sections: [],
      trafficEvents: [],
      isNewRow: true,
    }),

    onSave: async ({ created, updated }) => {
      try {
        for (const project of created) {
          await createProjectMutation.mutateAsync({
            title: project.title,
            summary: project.summary,
            description: project.description,
            accessType: project.accessType,
            status: project.status,
            price: project.price,
            currency: project.currency,
            mentorId: project.mentorId,
            categoryId: project.categoryId,
          });
        }

        for (const update of updated) {
          await updateProjectMutation.mutateAsync({
            id: Number(update.id),
            payload: {
              title: update.changes.title,
              summary: update.changes.summary,
              description: update.changes.description,
              accessType: update.changes.accessType,
              status: update.changes.status,
              price: update.changes.price,
              currency: update.changes.currency,
              mentorId: update.changes.mentorId,
              categoryId: update.changes.categoryId,
            },
          });
        }

        await queryClient.invalidateQueries({ queryKey: [QUERY_KEY.PROJECT_LIST] });
        return true;
      } catch (error) {
        console.error('Save projects failed:', error);
        return false;
      }
    },

    onDelete: async (rows) => {
      try {
        await Promise.all(rows.map((row) => deleteProjectMutation.mutateAsync(row.id)));
        await queryClient.invalidateQueries({ queryKey: [QUERY_KEY.PROJECT_LIST] });
        return true;
      } catch (error) {
        console.error('Delete projects failed:', error);
        return false;
      }
    },
  });

  // Optional: Helpers adjusted to look into the Author relation inside the Project
  const getAuthorRoleIds = (project: EditableProject): number[] => {
    const editedRoleIds = crud.getFieldValue(project, 'roleIds');
    if (Array.isArray(editedRoleIds)) return editedRoleIds;
    if (Array.isArray(project.roleIds)) return project.roleIds;
    return project.author?.roles.map((role) => role.id) || [];
  };

  const getAuthorRoleNames = (project: EditableProject, roles: Role[]): string[] => {
    const roleIds = getAuthorRoleIds(project);
    return roleIds.map((roleId) => roles.find((role) => role.id === roleId)?.name).filter(Boolean) as string[];
  };

  return {
    ...crud,
    getAuthorRoleIds,
    getAuthorRoleNames,
  };
};
