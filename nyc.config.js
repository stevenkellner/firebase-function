'use strict';

module.exports = {
    extends: '@istanbuljs/nyc-config-typescript',
    all: true,
    'check-coverage': true,
    extension: ['.js', '.ts'],
    reporter: ['html', 'text-summary'],
    include: ['src/**/*'],
    exclude: [
        'example/**/*'
    ]
}
