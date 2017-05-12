{
    'targets': [{
        'target_name': 'opendkimBinding',
        'sources': [
            'src/opendkim.cc',
        ],
        'include_dirs': [
            'deps/opendkim',
           '<!(node -e "require(\'nan\')")'
        ],
        'dependencies': [
            'deps/opendkim/opendkim.gyp:libopendkim'
        ],
        'cflags_cc': [
                '-Wall',
                '-O3'
            ],
            'cflags': [
                '-Wall',
                '-O3'
            ]
    }]
}
