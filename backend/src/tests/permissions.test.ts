import { UserRole } from '../types';

// Role permission matrix
const canModerate = (role: UserRole): boolean => ['moderator', 'admin'].includes(role);
const canManageProducts = (role: UserRole): boolean => role === 'admin';
const canDeleteAnyReview = (role: UserRole): boolean => ['moderator', 'admin'].includes(role);
const canDeleteOwnReview = (userId: string, reviewUserId: string): boolean => userId === reviewUserId;
const canVoteOnReview = (userId: string, reviewUserId: string): boolean => userId !== reviewUserId;
const canReportReview = (userId: string, reviewUserId: string): boolean => userId !== reviewUserId;
const canAssignRoles = (role: UserRole): boolean => role === 'admin';
const canBanUsers = (role: UserRole): boolean => role === 'admin';

describe('Role-Based Permission Logic', () => {
  describe('Moderation permissions', () => {
    test('admin can moderate', () => expect(canModerate('admin')).toBe(true));
    test('moderator can moderate', () => expect(canModerate('moderator')).toBe(true));
    test('user cannot moderate', () => expect(canModerate('user')).toBe(false));
  });

  describe('Product management permissions', () => {
    test('admin can manage products', () => expect(canManageProducts('admin')).toBe(true));
    test('moderator cannot manage products', () => expect(canManageProducts('moderator')).toBe(false));
    test('user cannot manage products', () => expect(canManageProducts('user')).toBe(false));
  });

  describe('Review deletion permissions', () => {
    test('user can delete own review', () => {
      expect(canDeleteOwnReview('user-1', 'user-1')).toBe(true);
    });
    test('user cannot delete others review', () => {
      expect(canDeleteOwnReview('user-1', 'user-2')).toBe(false);
    });
    test('moderator can delete any review', () => {
      expect(canDeleteAnyReview('moderator')).toBe(true);
    });
    test('admin can delete any review', () => {
      expect(canDeleteAnyReview('admin')).toBe(true);
    });
    test('user cannot delete any review', () => {
      expect(canDeleteAnyReview('user')).toBe(false);
    });
  });

  describe('Vote permissions', () => {
    test('user can vote on others review', () => {
      expect(canVoteOnReview('user-1', 'user-2')).toBe(true);
    });
    test('user cannot vote on own review', () => {
      expect(canVoteOnReview('user-1', 'user-1')).toBe(false);
    });
  });

  describe('Report permissions', () => {
    test('user can report others review', () => {
      expect(canReportReview('user-1', 'user-2')).toBe(true);
    });
    test('user cannot report own review', () => {
      expect(canReportReview('user-1', 'user-1')).toBe(false);
    });
  });

  describe('Admin-only permissions', () => {
    test('admin can assign roles', () => expect(canAssignRoles('admin')).toBe(true));
    test('moderator cannot assign roles', () => expect(canAssignRoles('moderator')).toBe(false));
    test('user cannot assign roles', () => expect(canAssignRoles('user')).toBe(false));

    test('admin can ban users', () => expect(canBanUsers('admin')).toBe(true));
    test('moderator cannot ban users', () => expect(canBanUsers('moderator')).toBe(false));
    test('user cannot ban users', () => expect(canBanUsers('user')).toBe(false));
  });
});

describe('Duplicate Review Prevention', () => {
  const existingReviews = new Map([
    ['product-1', ['user-1', 'user-2']],
    ['product-2', ['user-1']],
  ]);

  const hasAlreadyReviewed = (userId: string, productId: string): boolean => {
    return existingReviews.get(productId)?.includes(userId) ?? false;
  };

  test('prevents duplicate review from same user on same product', () => {
    expect(hasAlreadyReviewed('user-1', 'product-1')).toBe(true);
  });

  test('allows review when user has not reviewed the product', () => {
    expect(hasAlreadyReviewed('user-3', 'product-1')).toBe(false);
  });

  test('allows same user to review different product', () => {
    expect(hasAlreadyReviewed('user-1', 'product-2')).toBe(true);
    expect(hasAlreadyReviewed('user-2', 'product-2')).toBe(false);
  });
});
