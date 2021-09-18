/*
 * Copyright 2020 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Entity } from '@backstage/catalog-model';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { render } from '@testing-library/react';
import React from 'react';
import { isKind, isKindType, isComponentType } from './conditions';
import { EntitySwitch } from './EntitySwitch';
import { featureFlagsApiRef } from '@backstage/core-plugin-api';
import {
  LocalStorageFeatureFlags,
  ApiProvider,
  ApiRegistry,
} from '@backstage/core-app-api';

const mockFeatureFlagsApi = new LocalStorageFeatureFlags();
const Wrapper = ({ children }: { children?: React.ReactNode }) => (
  <ApiProvider apis={ApiRegistry.with(featureFlagsApiRef, mockFeatureFlagsApi)}>
    {children}
  </ApiProvider>
);

describe('EntitySwitch', () => {
  it('should switch child when entity switches by kind', () => {
    const content = (
      <EntitySwitch>
        <EntitySwitch.Case if={isKind('component')} children="A" />
        <EntitySwitch.Case if={isKind('template')} children="B" />
        <EntitySwitch.Case children="C" />
      </EntitySwitch>
    );

    const rendered = render(
      <Wrapper>
        <EntityProvider entity={{ kind: 'component' } as Entity}>
          {content}
        </EntityProvider>
      </Wrapper>,
    );

    expect(rendered.queryByText('A')).toBeInTheDocument();
    expect(rendered.queryByText('B')).not.toBeInTheDocument();
    expect(rendered.queryByText('C')).not.toBeInTheDocument();

    rendered.rerender(
      <Wrapper>
        <EntityProvider entity={{ kind: 'template' } as Entity}>
          {content}
        </EntityProvider>
      </Wrapper>,
    );

    expect(rendered.queryByText('A')).not.toBeInTheDocument();
    expect(rendered.queryByText('B')).toBeInTheDocument();
    expect(rendered.queryByText('C')).not.toBeInTheDocument();

    rendered.rerender(
      <Wrapper>
        <EntityProvider entity={{ kind: 'derp' } as Entity}>
          {content}
        </EntityProvider>
      </Wrapper>,
    );

    expect(rendered.queryByText('A')).not.toBeInTheDocument();
    expect(rendered.queryByText('B')).not.toBeInTheDocument();
    expect(rendered.queryByText('C')).toBeInTheDocument();
  });

  it('should switch child when entity switches by kind and type', () => {
    const content = (
      <EntitySwitch>
        <EntitySwitch.Case if={isComponentType('library')} children="A" />
        <EntitySwitch.Case if={isComponentType('service')} children="B" />
        <EntitySwitch.Case if={isKindType('group', 'team')} children="C" />
        <EntitySwitch.Case if={isKindType('group', 'unit')} children="D" />
        <EntitySwitch.Case children="E" />
      </EntitySwitch>
    );

    const rendered = render(
      <Wrapper>
        <EntityProvider
          entity={
            {
              kind: 'component',
              spec: { type: 'library' },
            } as unknown as Entity
          }
        >
          {content}
        </EntityProvider>
      </Wrapper>,
    );

    expect(rendered.queryByText('A')).toBeInTheDocument();
    expect(rendered.queryByText('B')).not.toBeInTheDocument();
    expect(rendered.queryByText('C')).not.toBeInTheDocument();
    expect(rendered.queryByText('D')).not.toBeInTheDocument();
    expect(rendered.queryByText('E')).not.toBeInTheDocument();

    rendered.rerender(
      <Wrapper>
        <EntityProvider
          entity={
            {
              kind: 'component',
              spec: { type: 'service' },
            } as unknown as Entity
          }
        >
          {content}
        </EntityProvider>
      </Wrapper>,
    );

    expect(rendered.queryByText('A')).not.toBeInTheDocument();
    expect(rendered.queryByText('B')).toBeInTheDocument();
    expect(rendered.queryByText('C')).not.toBeInTheDocument();
    expect(rendered.queryByText('D')).not.toBeInTheDocument();
    expect(rendered.queryByText('E')).not.toBeInTheDocument();

    rendered.rerender(
      <Wrapper>
        <EntityProvider
          entity={
            { kind: 'group', spec: { type: 'team' } } as unknown as Entity
          }
        >
          {content}
        </EntityProvider>
      </Wrapper>,
    );

    expect(rendered.queryByText('A')).not.toBeInTheDocument();
    expect(rendered.queryByText('B')).not.toBeInTheDocument();
    expect(rendered.queryByText('C')).toBeInTheDocument();
    expect(rendered.queryByText('D')).not.toBeInTheDocument();
    expect(rendered.queryByText('E')).not.toBeInTheDocument();

    rendered.rerender(
      <Wrapper>
        <EntityProvider
          entity={
            { kind: 'group', spec: { type: 'unit' } } as unknown as Entity
          }
        >
          {content}
        </EntityProvider>
      </Wrapper>,
    );

    expect(rendered.queryByText('A')).not.toBeInTheDocument();
    expect(rendered.queryByText('B')).not.toBeInTheDocument();
    expect(rendered.queryByText('C')).not.toBeInTheDocument();
    expect(rendered.queryByText('D')).toBeInTheDocument();
    expect(rendered.queryByText('E')).not.toBeInTheDocument();

    rendered.rerender(
      <Wrapper>
        <EntityProvider entity={{ kind: 'derp' } as Entity}>
          {content}
        </EntityProvider>
      </Wrapper>,
    );

    expect(rendered.queryByText('A')).not.toBeInTheDocument();
    expect(rendered.queryByText('B')).not.toBeInTheDocument();
    expect(rendered.queryByText('C')).not.toBeInTheDocument();
    expect(rendered.queryByText('D')).not.toBeInTheDocument();
    expect(rendered.queryByText('E')).toBeInTheDocument();
  });

  it('should switch child when filters switch', () => {
    const entity = { kind: 'component' } as Entity;

    const rendered = render(
      <Wrapper>
        <EntityProvider entity={entity}>
          <EntitySwitch>
            <EntitySwitch.Case if={isKind('component')} children="A" />
            <EntitySwitch.Case children="B" />
          </EntitySwitch>
        </EntityProvider>
      </Wrapper>,
    );

    expect(rendered.queryByText('A')).toBeInTheDocument();
    expect(rendered.queryByText('B')).not.toBeInTheDocument();

    rendered.rerender(
      <Wrapper>
        <EntityProvider entity={entity}>
          <EntitySwitch>
            <EntitySwitch.Case if={isKind('template')} children="A" />
            <EntitySwitch.Case children="B" />
          </EntitySwitch>
        </EntityProvider>
      </Wrapper>,
    );

    expect(rendered.queryByText('A')).not.toBeInTheDocument();
    expect(rendered.queryByText('B')).toBeInTheDocument();
  });
});
