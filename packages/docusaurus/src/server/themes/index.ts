/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {ThemeAlias} from '@docusaurus/types';
import {themeAlias} from './alias';

export function loadThemeAlias(themePaths: string[]): ThemeAlias {
  return themePaths.reduce(
    (alias, themePath) => ({
      ...alias,
      ...themeAlias(themePath),
    }),
    {},
  );
}
