#ifndef _OPENDKIMHEADERASYNC_H
#define _OPENDKIMHEADERASYNC_H

#include "opendkim_async.h"

class OpenDKIMHeaderAsyncWorker : public OpenDKIMAsyncWorker {
  public:
    OpenDKIMHeaderAsyncWorker(Nan::NAN_METHOD_ARGS_TYPE info) :
      OpenDKIMAsyncWorker(new Nan::Callback(info[1].As<v8::Function>()))
    {
      result = OpenDKIM::HeaderArgs(
        info,
        &obj,
        &header,
        &length
      );
      v8::Local<v8::Object> _this = info.This();
      SaveToPersistent("OpenDKIM", _this);
    };

    void Execute();
    void HandleOKCallback();

  private:
    // private methods/variables here
    char *header;
    int length;
};

#endif /* _OPENDKIMHEADERASYNC_ */
