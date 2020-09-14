/*

 MIT License

 Copyright (c) 2020 Looker Data Sciences, Inc.

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.

 */

import React, { FC } from 'react'
import { typeRefs, methodRefs, ApiModel } from '@looker/sdk-codegen'
import { useParams } from 'react-router-dom'

import { Section } from '../../components/Layout'
import { DocReferences, DocSDKs, DocTitle } from '../../components'

interface DocTypeProps {
  api: ApiModel
}

interface DocTypeParams {
  specKey: string
  typeName: string
}

export const TypeScene: FC<DocTypeProps> = ({ api }) => {
  const { specKey, typeName } = useParams<DocTypeParams>()
  const type = api.types[typeName]
  const seeTypes = typeRefs(api, type.customTypes)
  const seeMethods = methodRefs(api, type.methodRefs)

  return (
    <Section>
      <DocTitle>{type.name}</DocTitle>
      <DocReferences
        seeTypes={seeTypes}
        seeMethods={seeMethods}
        api={api}
        specKey={specKey}
      />
      <DocSDKs type={type} api={api} />
    </Section>
  )
}
