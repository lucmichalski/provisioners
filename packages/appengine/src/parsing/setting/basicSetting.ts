import { SettingsParser, Setting } from '..'
import createDebug from 'debug'

const debug = createDebug('@appengine:BasicSettingParser')

class BasicSettingParser implements SettingsParser {


    parse(args: any, spec: any, type: string): Setting[] {
        debug(`Settings Inputs: ${type} ${JSON.stringify(spec)}`)
        let results = this.parseObject(args, type)
        results = results.concat(this.parseObject(spec, type))
        debug(`Settings Outputs: ${type} ${JSON.stringify(results)}`)
        return results as Setting[]
    }

    parseObject(args: any, type: string): Setting[] {

        const results = []
        if(!args || !args[type]) return []
        const rawValues = args[type]
        if (!rawValues || rawValues == '') return []

        if (Array.isArray(rawValues)) {
            for (const p of rawValues) {
                if(p === null) continue

                if (typeof p === 'object')
                    results.push(p as Setting)
                else
                    results.push(this.parseSingle(p))
            }
        } else {

            if (typeof rawValues === 'object')
                results.push(rawValues)
            else
                results.push(this.parseSingle(rawValues))

        }

        return results as Setting[]
    }


    parseSingle(single: string) : Setting {

        //provison takes a file as an input..

        //czctl install --local --n testing photoshow --secret foo:bar --config d:fff,D_VAR --config E:fff,D_VAR --out yaml
        //NAME:VALUE,ENV_VAR_NAME
        //split
        const pos = single.indexOf(':')
        const value = { name: '', value: '', env: '' }

        if (pos > 0) {
            value.name = single.substr(0, pos).toLowerCase()
            const right = single.substr(pos + 1)
            const comma = right.indexOf(',')

            if (comma > 0) {
                value.value = right.substr(0, comma)
                value.env = right.substr(comma + 1)
            } else
                value.value = right

        }
        if(!value.env || value.env === '')
            value.env = value.name

        return value as Setting
    }
}
export { BasicSettingParser }
