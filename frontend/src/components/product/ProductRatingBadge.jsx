import React from 'react';
import { Badge } from '@astryxdesign/core';

const getReviewSummary = (product) => {
  const summary = product?.reviewSummary || {};
  const reviewCount = Number(summary.reviewCount ?? product?.reviewCount ?? 0);
  const averageRating = Number(summary.averageRating ?? product?.averageRating);

  if (!Number.isFinite(averageRating) || !Number.isFinite(reviewCount) || reviewCount <= 0) {
    return null;
  }

  return {
    averageRating,
    reviewCount,
  };
};

export const ProductRatingBadge = ({ product }) => {
  const reviewSummary = getReviewSummary(product);

  if (!reviewSummary || reviewSummary.reviewCount <= 0) {
    return null;
  }

  const ratingLabel = `${reviewSummary.averageRating.toFixed(1)}/5 (${reviewSummary.reviewCount})`;

  return <Badge variant="yellow" label={ratingLabel} />;
};

export default ProductRatingBadge;
