{
  "targets": [
    {
      "target_name": "opendkim",
      "include_dirs" : [
        '/usr/local/include',
        "<!(node -e \"require('nan')\")"
      ],
      "sources": [
        'src/opendkim.cc',
      ],
      "libraries": [
        "-lopendkim",
        "-L/usr/local/lib"
      ]
    }
  ]
}
