/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {Remarkable} = require('remarkable');
const mdToc = require('markdown-toc');
const GithubSlugger = require('github-slugger');
const toSlug = require('./toSlug');

const tocRegex = new RegExp('<AUTOGENERATED_TABLE_OF_CONTENTS>', 'i');

/**
 * Returns a table of content from the headings
 *
 * @return array
 * Array of heading objects with `hashLink`, `content` and `children` fields
 *
 */
function getTOC(content, headingTags = 'h2', subHeadingTags = 'h3') {
  const tagToLevel = tag => Number(tag.slice(1));
  const headingLevels = [].concat(headingTags).map(tagToLevel);
  const subHeadingLevels = subHeadingTags
    ? [].concat(subHeadingTags).map(tagToLevel)
    : [];
  const allowedHeadingLevels = headingLevels.concat(subHeadingLevels);
  const md = new Remarkable({
    // Enable HTML tags in source (same as './renderMarkdown.js')
    html: true,
  });
  const headings = mdToc(content).json;
  const toc = [];
  const slugger = new GithubSlugger();
  let current;

  headings.forEach(heading => {
    const rawContent = heading.content;
    const rendered = md.renderInline(rawContent);

    const hashLink = toSlug(rawContent, slugger);
    if (!allowedHeadingLevels.includes(heading.lvl)) {
      return;
    }
    const entry = {
      hashLink,
      rawContent,
      content: rendered,
      children: [],
    };
    if (headingLevels.includes(heading.lvl)) {
      toc.push(entry);
      current = entry;
    } else if (current) {
      current.children.push(entry);
    }
  });
  return toc;
}

// takes the content of a doc article and returns the content with a table of
// contents inserted
function insertTOC(rawContent) {
  if (!rawContent || !tocRegex.test(rawContent)) {
    return rawContent;
  }
  const filterRe = /^`[^`]*`/;
  const headers = getTOC(rawContent, 'h3', null);
  const tableOfContents = headers
    .filter(header => filterRe.test(header.rawContent))
    .map(header => `  - [${header.rawContent}](#${header.hashLink})`)
    .join('\n');
  return rawContent.replace(tocRegex, tableOfContents);
}

module.exports = {
  getTOC,
  insertTOC,
};
