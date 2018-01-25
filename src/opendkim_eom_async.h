#ifndef _OPENDKIMEOMASYNC_H
#define _OPENDKIMEOMASYNC_H

#include "opendkim_async.h"

class OpenDKIMEOMAsyncWorker : public OpenDKIMAsyncWorker {
  public:
    OpenDKIMEOMAsyncWorker(Nan::NAN_METHOD_ARGS_TYPE info) :
      OpenDKIMAsyncWorker(new Nan::Callback(info[1].As<v8::Function>()))
    {
      result = OpenDKIM::EOMArgs(info, &obj, &returntest);
    };

    void Execute();
    void HandleOKCallback();

  private:
    // private methods/variables here
    bool returntest;
    bool testkey;
};

#endif /* _OPENDKIMEOMASYNC_ */
