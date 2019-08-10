/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2019 Looker Data Sciences, Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

import { ApiSettingsIniFile } from "../rtl/apiSettings"
import { UserSession } from "../rtl/userSession"
import { LookerSDK } from "../sdk/methods"

describe('LookerSDK', () => {
  // TODO get file test paths configured
  // const localIni = '../../../looker.ini'
  const localIni = '/Users/looker/sdk_codegen/looker.ini'
  const settings = new ApiSettingsIniFile(localIni, 'Looker')
  const userSession = new UserSession(settings)

  describe('automatic authentication for API calls', () => {
    it ('me returns the correct result', async () => {
      const sdk = new LookerSDK(userSession)
      const actual = await sdk.ok(sdk.me())
      expect(actual).toBeDefined()
      expect(actual.credentials_api3).toBeDefined()
      expect(actual.credentials_api3!.length).toBeGreaterThan(0)
      await sdk.userSession.logout()
      expect(sdk.userSession.isAuthenticated()).toBeFalsy()
    })

    it ('me fields filter', async () => {
      const sdk = new LookerSDK(userSession)
      const actual = await sdk.ok(sdk.me('id,first_name,last_name'))
      expect(actual).toBeDefined()
      expect(actual.id).toBeDefined()
      expect(actual.first_name).toBeDefined()
      expect(actual.last_name).toBeDefined()
      expect(actual.display_name).toBeUndefined()
      expect(actual.email).toBeUndefined()
      expect(actual.personal_space_id).toBeUndefined()
      await sdk.userSession.logout()
      expect(sdk.userSession.isAuthenticated()).toBeFalsy()
    })
  })

  describe('retrieves collections', () => {
    it ('search_looks returns looks', async () => {
      const sdk = new LookerSDK(userSession)
      const actual = await sdk.ok(sdk.search_looks({}))
      expect(actual).toBeDefined()
      expect(actual.length).toBeGreaterThan(0)
      const look = actual[0]
      expect(look.title).toBeDefined()
      await sdk.userSession.logout()
      expect(sdk.userSession.isAuthenticated()).toBeFalsy()
    })

    it ('search_looks fields filter', async () => {
      const sdk = new LookerSDK(userSession)
      const actual = await sdk.ok(sdk.search_looks({ fields: 'id,title,description'}))
      expect(actual).toBeDefined()
      expect(actual.length).toBeGreaterThan(0)
      const look = actual[0]
      expect(look.id).toBeDefined()
      expect(look.title).toBeDefined()
      expect(look.description).toBeDefined()
      expect(look.created_at).not.toBeDefined()
      await sdk.userSession.logout()
      expect(sdk.userSession.isAuthenticated()).toBeFalsy()
    })

    it ('search_looks fields filter', async () => {
      const sdk = new LookerSDK(userSession)
      const actual = await sdk.ok(sdk.search_looks(
        {
          title: 'Order%',
          fields: 'id,title'
        }))
      expect(actual).toBeDefined()
      expect(actual.length).toBeGreaterThan(1)
      const look = actual[0]
      expect(look.id).toBeDefined()
      expect(look.title).toBeDefined()
      expect(look.title).toContain('Order')
      expect(look.description).not.toBeDefined()
      await sdk.userSession.logout()
      expect(sdk.userSession.isAuthenticated()).toBeFalsy()
    })
  })

  describe('User CRUD-it checks', () => {
    it ('create, update, and delete user', async () => {
      const sdk = new LookerSDK(userSession)
      let user = await sdk.ok(sdk.create_user({
        first_name: 'Lloyd',
        last_name: 'Llookicorn',
        is_disabled: true,
        locale: 'fr'
      }))
      expect(user).toBeDefined()
      expect(user.first_name).toEqual('Lloyd')
      expect(user.last_name).toEqual('Llookicorn')
      expect(user.is_disabled).toEqual(true)
      expect(user.locale).toEqual('fr')
      user = await sdk.ok(sdk.update_user(user.id, {
        is_disabled: false,
        locale: 'en'
      }))
      expect(user.is_disabled).toEqual(false)
      expect(user.locale).toEqual('en')
      const creds = await sdk.ok(sdk.create_user_credentials_email(user.id,
        { email : 'lloyd@example.com'}
      ))
      expect(creds.email).toEqual('lloyd@example.com')
      const result = await sdk.ok(sdk.delete_user(user.id))
      expect(result).toEqual('')
      await sdk.userSession.logout()
      expect(sdk.userSession.isAuthenticated()).toBeFalsy()
    })

  })

  describe('Query calls', () => {
    it ('create and run query', async () => {
      const sdk = new LookerSDK(userSession)
      const query = await sdk.ok(sdk.create_query({
        model:'thelook',
        view:'users',
        fields: [
          'users.id', 'users.age', 'users.city', 'users.email', 'users.first_name',
          'users.last_name', 'users.zip', 'users.state', 'users.country'
        ],
        limit:'10',
        }))
      // console.log({query})
      const json = await sdk.ok(sdk.run_query({query_id: query.id, result_format: 'json'}))
      // console.log({json})
      const csv = await sdk.ok(sdk.run_query({query_id: query.id, result_format: 'csv'}))
      // console.log({csv})
      expect(query).toBeDefined()
      expect(query.id).toBeDefined()
      expect(query.id).toBeGreaterThan(0)
      expect(json).toBeDefined()
      expect(json.length).toEqual(10)
      const row = json[0] as any
      expect(row.hasOwnProperty('users.id')).toBeTruthy()
      expect(row.hasOwnProperty('users.age')).toBeTruthy()
      expect(row.hasOwnProperty('users.city')).toBeTruthy()
      expect(row.hasOwnProperty('users.email')).toBeTruthy()
      expect(row.hasOwnProperty('users.first_name')).toBeTruthy()
      expect(row.hasOwnProperty('users.last_name')).toBeTruthy()
      expect(row.hasOwnProperty('users.zip')).toBeTruthy()
      expect(row.hasOwnProperty('users.state')).toBeTruthy()
      expect(row.hasOwnProperty('users.country')).toBeTruthy()
      expect(row.hasOwnProperty('users.gender')).toBeFalsy()
      expect(csv).toBeDefined()
      expect(csv).toContain('Users ID,Users Age,Users City,Users Email,Users First Name,Users Last Name,Users Zip,Users State,Users Country')
      expect((csv.match(/\n/g) || []).length).toEqual(11)
      await sdk.userSession.logout()
      expect(sdk.userSession.isAuthenticated()).toBeFalsy()
    })

  })

})
