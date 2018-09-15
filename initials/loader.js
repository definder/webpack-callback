const getOptions = require('loader-utils').getOptions;
const validateOptions = require('schema-utils');
const acorn = require('acorn-jsx/inject')(require('acorn-stage3'));
const acornWalk  = require("acorn/dist/walk");
const generateAction = require('../src/generateAction').default;

const schema = {
    type: 'object',
    properties: {
        test: {
            type: 'string'
        }
    }
}

function replaceDefineAction(source, replacString, insertableSource) {
    return source.replace(replacString, insertableSource)
}

function convertToArguments(argument) {
    switch (argument.type) {
        case 'Literal':
            return argument.value;
        case 'ArrayExpression':
            return argument.elements.map(convertToArguments);
    }
}

function callToString(args) {
    return JSON.stringify(args)
}

function subStringGenerateAction(source, indexStart, indexEnd) {
    return source.substring(indexStart, indexEnd)
}

function RemoveGenerateConstants() {
    this.initials = null
    this.calls = []

    this.setInitials = (node, name) => {
        this.initials = {
            variable: name || null,
            position: RemoveGenerateConstants.setPosition(node.start, node.end)
        }
    }
    this.updateInitials = (name, node) => {
        this.initials.variable = name
        if(node) {
            this.initials.position = RemoveGenerateConstants.setPosition(node.start, node.end)
        }
    }

    this.checkInitialsPosition = (end) => {
        return this.initials.position.end === end
    }

    this.checkCallsAndUpdate = (node) => {
        if(node.callee.name === this.initials.variable) {
            this.calls.push({
                position: RemoveGenerateConstants.setPosition(node.start, node.end),
                variable: null,
                call: generateAction(...node.arguments.map(convertToArguments)),
                isGetter: false,
            })
            return true
        }
        let indexCall = false
        let nextCall = false
        this.calls.some((value, key) => {
            // проверка на принадлежность метода к существующему выражению
            if(node.start === value.position.start){
                indexCall = key
                return true
            }
            // проверка на принадлежность метода к существующему выражению и переопределение в новую переменную
            if(node.callee.object && node.callee.object.name === value.variable) {
                indexCall = key
                nextCall = true
                return true
            }
            return false
        })
        if(nextCall !== false) {
            indexCall = this.calls.push({
                position: RemoveGenerateConstants.setPosition(node.start, node.end),
                variable: null,
                call: this.calls[indexCall].call,
                isGetter: false,
            }) - 1
        }
        if(indexCall !== false) {
            this.calls[indexCall].position = RemoveGenerateConstants.setPosition(node.start, node.end)
            this.calls[indexCall].call = this.calls[indexCall].call[node.callee.property.name](...node.arguments.map(convertToArguments))
            this.calls[indexCall].isGetter = !this.calls[indexCall].call[node.callee.property.name]
        }
    }

    // Поиск переменной и обновление стека вызовов
    this.checkCallsVariableAndUpdate = (node) => {
        let indexCall = false
        this.calls.some((value, key) => {
            if(node.declarations[0].end === value.position.end){
                indexCall = key
                return true
            }
            return false
        })
        if(indexCall !== false) {
            this.calls[indexCall].variable = node.declarations[0].id.name
            if(!this.calls[indexCall].isGetter) {
                this.calls[indexCall].position = RemoveGenerateConstants.setPosition(node.start, node.end)
            }
        }
    }
}

RemoveGenerateConstants.setPosition = function (start, end) {
    return {
        start,
        end,
    }
}

module.exports = {
    default: function (source) {
        const options = getOptions(this);

        validateOptions(schema, options, 'Example Loader');

        const _RemoveGenerateConstants = new RemoveGenerateConstants()

        acornWalk.ancestor(acorn.parse(source, {sourceType: 'module'}), {
            VariableDeclaration(node) {
                if (_RemoveGenerateConstants.initials) {
                    if(!_RemoveGenerateConstants.initials.variable) {
                        if (_RemoveGenerateConstants.checkInitialsPosition(node.declarations[0].end)) {
                            _RemoveGenerateConstants.updateInitials(node.declarations[0].id.name, node)
                        }
                    } else {
                        _RemoveGenerateConstants.checkCallsVariableAndUpdate(node)
                    }
                }
            },
            CallExpression(node) {
                _RemoveGenerateConstants.initials && _RemoveGenerateConstants.checkCallsAndUpdate(node)
            },
            MemberExpression(node) {
                if (!_RemoveGenerateConstants.initials && node.object.callee && node.object.callee.name === 'require' && node.object.arguments[0] && node.object.arguments[0].value.match(/generateAction/)) {
                    _RemoveGenerateConstants.setInitials(node) // Запись названия переменной функции констант
                }
            },
            ImportDeclaration(node) {
                if (!_RemoveGenerateConstants.initials && node.source && node.source.value.match(/generateAction/)) {
                    _RemoveGenerateConstants.setInitials(node, node.specifiers[0].local.name) // Запись названия переменной функции констант
                }
            },
        })

        if(_RemoveGenerateConstants.initials) {
            let _parse = [{
                toInsert: '',
                toReplace: subStringGenerateAction(source, _RemoveGenerateConstants.initials.position.start, _RemoveGenerateConstants.initials.position.end)
            }]
            _parse = _parse.concat(_RemoveGenerateConstants.calls.map(value => ({
                toInsert: value.isGetter ? callToString(value.call) : '',
                toReplace: subStringGenerateAction(source, value.position.start, value.position.end)
            })))
            _parse.forEach(func => {
                source = replaceDefineAction(source, func.toReplace, func.toInsert)
            });
        }

        return source
    }
}